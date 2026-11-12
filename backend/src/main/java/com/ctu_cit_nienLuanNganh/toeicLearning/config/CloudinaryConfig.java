package com.ctu_cit_nienLuanNganh.toeicLearning.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.conn.DnsResolver;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.conn.socket.PlainConnectionSocketFactory;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.InputStream;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.UnknownHostException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.Security;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Configuration
@Slf4j
public class CloudinaryConfig {

    private static final String[] PUBLIC_DNS_SERVERS = {"8.8.8.8", "1.1.1.1", "8.8.4.4", "1.0.0.1"};
    private static final Pattern IPV4_PATTERN = Pattern.compile("\"data\"\\s*:\\s*\"((?:[0-9]{1,3}\\.){3}[0-9]{1,3})\"");
    private static final Map<String, List<byte[]>> RESOLVED_IPV4_CACHE = new ConcurrentHashMap<>();

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String secretKey;

    @Bean
    public Cloudinary cloudinary() {
        try {
            Security.setProperty("networkaddress.cache.negative.ttl", "0");
        } catch (Exception ignored) {
        }

        PoolingHttpClientConnectionManager connectionManager = new PoolingHttpClientConnectionManager(
                RegistryBuilder.<ConnectionSocketFactory>create()
                        .register("http", PlainConnectionSocketFactory.getSocketFactory())
                        .register("https", SSLConnectionSocketFactory.getSocketFactory())
                        .build(),
                null,
                null,
                createFallbackDnsResolver(),
                -1,
                TimeUnit.MILLISECONDS
        );
        connectionManager.setMaxTotal(50);
        connectionManager.setDefaultMaxPerRoute(20);

        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName == null ? "" : cloudName.trim(),
                "api_key", apiKey == null ? "" : apiKey.trim(),
                "api_secret", secretKey == null ? "" : secretKey.trim(),
                "secure", true,
                "timeout", 30000,
                "properties", ObjectUtils.asMap("connectionManager", connectionManager)
        ));
    }

    private DnsResolver createFallbackDnsResolver() {
        return host -> {
            if (host == null || host.isBlank()) {
                throw new UnknownHostException("Empty host");
            }
            String normalizedHost = host.trim();
            try {
                InetAddress[] systemAddresses = InetAddress.getAllByName(normalizedHost);
                if (systemAddresses != null && systemAddresses.length > 0) {
                    Arrays.sort(systemAddresses, (a, b) -> {
                        boolean a4 = a instanceof Inet4Address;
                        boolean b4 = b instanceof Inet4Address;
                        return Boolean.compare(!a4, !b4);
                    });
                    List<byte[]> ipv4List = new ArrayList<>();
                    for (InetAddress address : systemAddresses) {
                        if (address instanceof Inet4Address) {
                            ipv4List.add(address.getAddress());
                        }
                    }
                    if (!ipv4List.isEmpty()) {
                        RESOLVED_IPV4_CACHE.put(normalizedHost, ipv4List);
                    }
                    return systemAddresses;
                }
            } catch (UnknownHostException ignored) {
                // Fall through to UDP / DoH public DNS resolvers
            }

            for (String dnsServer : PUBLIC_DNS_SERVERS) {
                List<byte[]> ipv4Records = queryUdpDnsARecords(normalizedHost, dnsServer);
                if (!ipv4Records.isEmpty()) {
                    RESOLVED_IPV4_CACHE.put(normalizedHost, ipv4Records);
                    return toInetAddresses(normalizedHost, ipv4Records);
                }
            }

            List<byte[]> dohRecords = queryDohARecords(normalizedHost);
            if (!dohRecords.isEmpty()) {
                RESOLVED_IPV4_CACHE.put(normalizedHost, dohRecords);
                return toInetAddresses(normalizedHost, dohRecords);
            }

            List<byte[]> cached = RESOLVED_IPV4_CACHE.get(normalizedHost);
            if (cached != null && !cached.isEmpty()) {
                return toInetAddresses(normalizedHost, cached);
            }

            throw new UnknownHostException(normalizedHost);
        };
    }

    private InetAddress[] toInetAddresses(String host, List<byte[]> ipv4BytesList) throws UnknownHostException {
        InetAddress[] result = new InetAddress[ipv4BytesList.size()];
        for (int i = 0; i < ipv4BytesList.size(); i++) {
            result[i] = InetAddress.getByAddress(host, ipv4BytesList.get(i));
        }
        return result;
    }

    private List<byte[]> queryUdpDnsARecords(String domain, String dnsServer) {
        List<byte[]> results = new ArrayList<>();
        try (DatagramSocket socket = new DatagramSocket()) {
            socket.setSoTimeout(1500);
            ByteArrayOutputStream byteStream = new ByteArrayOutputStream(128);
            DataOutputStream out = new DataOutputStream(byteStream);
            out.writeShort(0x1234); // Transaction ID
            out.writeShort(0x0100); // Standard query, recursion desired
            out.writeShort(1);      // QDCOUNT
            out.writeShort(0);      // ANCOUNT
            out.writeShort(0);      // NSCOUNT
            out.writeShort(0);      // ARCOUNT
            for (String label : domain.split("\\.")) {
                byte[] labelBytes = label.getBytes(StandardCharsets.US_ASCII);
                out.writeByte(labelBytes.length);
                out.write(labelBytes);
            }
            out.writeByte(0);       // End of QNAME
            out.writeShort(1);      // QTYPE = A
            out.writeShort(1);      // QCLASS = IN

            byte[] queryBytes = byteStream.toByteArray();
            DatagramPacket requestPacket = new DatagramPacket(
                    queryBytes, queryBytes.length, new InetSocketAddress(dnsServer, 53));
            socket.send(requestPacket);

            byte[] responseBuffer = new byte[512];
            DatagramPacket responsePacket = new DatagramPacket(responseBuffer, responseBuffer.length);
            socket.receive(responsePacket);

            int length = responsePacket.getLength();
            if (length < 12) return results;
            int flags = ((responseBuffer[2] & 0xFF) << 8) | (responseBuffer[3] & 0xFF);
            if ((flags & 0x000F) != 0) return results; // RCODE != 0
            int qdCount = ((responseBuffer[4] & 0xFF) << 8) | (responseBuffer[5] & 0xFF);
            int anCount = ((responseBuffer[6] & 0xFF) << 8) | (responseBuffer[7] & 0xFF);

            int pos = 12;
            for (int q = 0; q < qdCount; q++) {
                pos = skipDnsName(responseBuffer, pos, length);
                if (pos < 0 || pos + 4 > length) return results;
                pos += 4;
            }
            for (int a = 0; a < anCount; a++) {
                pos = skipDnsName(responseBuffer, pos, length);
                if (pos < 0 || pos + 10 > length) break;
                int type = ((responseBuffer[pos] & 0xFF) << 8) | (responseBuffer[pos + 1] & 0xFF);
                int clazz = ((responseBuffer[pos + 2] & 0xFF) << 8) | (responseBuffer[pos + 3] & 0xFF);
                int rdLength = ((responseBuffer[pos + 8] & 0xFF) << 8) | (responseBuffer[pos + 9] & 0xFF);
                pos += 10;
                if (pos + rdLength > length) break;
                if (type == 1 && clazz == 1 && rdLength == 4) {
                    byte[] ipv4 = new byte[4];
                    System.arraycopy(responseBuffer, pos, ipv4, 0, 4);
                    results.add(ipv4);
                }
                pos += rdLength;
            }
        } catch (Exception ignored) {
        }
        return results;
    }

    private int skipDnsName(byte[] buffer, int offset, int length) {
        int pos = offset;
        while (pos < length) {
            int b = buffer[pos] & 0xFF;
            if (b == 0) {
                return pos + 1;
            }
            if ((b & 0xC0) == 0xC0) {
                return (pos + 2 <= length) ? pos + 2 : -1;
            }
            pos += 1 + b;
        }
        return -1;
    }

    private List<byte[]> queryDohARecords(String domain) {
        List<byte[]> results = new ArrayList<>();
        String[] dohUrls = {
                "https://1.1.1.1/dns-query?name=" + domain + "&type=A",
                "https://8.8.8.8/resolve?name=" + domain + "&type=A"
        };
        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(2000))
                .build();
        for (String url : dohUrls) {
            try {
                HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                        .timeout(Duration.ofMillis(2500))
                        .header("Accept", "application/dns-json")
                        .GET()
                        .build();
                HttpResponse<InputStream> response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());
                if (response.statusCode() == 200) {
                    String body = new String(response.body().readAllBytes(), StandardCharsets.UTF_8);
                    Matcher matcher = IPV4_PATTERN.matcher(body);
                    while (matcher.find()) {
                        byte[] ipv4 = parseIpv4Literal(matcher.group(1));
                        if (ipv4 != null) {
                            results.add(ipv4);
                        }
                    }
                    if (!results.isEmpty()) {
                        return results;
                    }
                }
            } catch (Exception ignored) {
            }
        }
        return results;
    }

    private byte[] parseIpv4Literal(String ip) {
        String[] parts = ip.split("\\.");
        if (parts.length != 4) return null;
        byte[] bytes = new byte[4];
        try {
            for (int i = 0; i < 4; i++) {
                int octet = Integer.parseInt(parts[i]);
                if (octet < 0 || octet > 255) return null;
                bytes[i] = (byte) octet;
            }
            return bytes;
        } catch (NumberFormatException exception) {
            return null;
        }
    }
}
