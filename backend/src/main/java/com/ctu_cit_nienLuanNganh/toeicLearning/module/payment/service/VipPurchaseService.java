package com.ctu_cit_nienLuanNganh.toeicLearning.module.payment.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TestStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.PaymentTransaction;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Test;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.payment.dto.CheckoutResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.payment.dto.VipCheckoutRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.PaymentTransactionRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.TestEntitlementRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.TestRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VipPurchaseService {
    private static final String PRODUCT_TYPE = "TEST_VIP";

    private final UserRepository userRepository;
    private final TestRepository testRepository;
    private final TestEntitlementRepository entitlementRepository;
    private final PaymentTransactionRepository paymentRepository;
    private final PayosGatewayService gatewayService;
    private final PayosPaymentService paymentService;

    @Transactional
    public CheckoutResponse checkout(User user, VipCheckoutRequest request, String remoteAddress) {
        User buyer = userRepository.findByIdWithRoleForUpdate(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (Boolean.TRUE.equals(buyer.getIsLocked())) throw new AppException(ErrorCode.USER_ACCOUNT_LOCKED);

        Test test = testRepository.findForUpdateById(request.getTestId())
                .orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
        if (test.getStatus() != TestStatus.PUBLISHED || !Boolean.TRUE.equals(test.getIsVip())
                || test.getVipPriceVnd() == null) {
            throw new AppException(ErrorCode.TEST_NOT_FOUND);
        }
        if (entitlementRepository.existsByUser_IdAndTest_Id(buyer.getId(), test.getId())) {
            throw new AppException(ErrorCode.TEST_ALREADY_OWNED);
        }
        if (!gatewayService.isConfigured()) throw new AppException(ErrorCode.PAYMENT_NOT_CONFIGURED);

        var latest = paymentRepository.findTopByUser_IdAndTest_IdAndProductTypeOrderByPaymentDateDesc(
                buyer.getId(), test.getId(), PRODUCT_TYPE);
        PaymentTransaction payment = null;
        if (latest.isPresent()) {
            PaymentTransaction previous = latest.get();
            paymentService.syncPendingPaymentIfPossible(previous);
            if ("SUCCESS".equals(previous.getStatus())) {
                throw new AppException(ErrorCode.TEST_ALREADY_OWNED);
            }
            payment = previous;
            payment.setProductNameSnapshot(test.getTitleTest());
            payment.setAmount(test.getVipPriceVnd());
            payment.setPayosOrderCode(gatewayService.newOrderCode());
            payment.setProductType(PRODUCT_TYPE);
            payment.setStatus("PENDING");
            payment.setPaymentDate(java.time.LocalDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")));
            payment.setPayosCode(null);
            payment.setPayosStatus(null);
            payment.setPayosReference(null);
            payment.setPaidAt(null);
        }

        if (payment == null) {
            payment = PaymentTransaction.builder()
                    .user(buyer)
                    .test(test)
                    .productNameSnapshot(test.getTitleTest())
                    .amount(test.getVipPriceVnd())
                    .payosOrderCode(gatewayService.newOrderCode())
                    .productType(PRODUCT_TYPE)
                    .status("PENDING")
                    .build();
        }
        payment = paymentRepository.saveAndFlush(payment);
        return checkoutResponse(payment, remoteAddress);
    }

    private CheckoutResponse checkoutResponse(PaymentTransaction payment, String remoteAddress) {
        PayosGatewayService.CheckoutLink checkout = gatewayService.createCheckout(payment, remoteAddress);
        return CheckoutResponse.builder()
                .transactionReference(payment.getPayosOrderCode())
                .checkoutUrl(checkout.url())
                .paymentStatus(payment.getStatus())
                .amount(payment.getAmount())
                .expiresAt(checkout.expiresAt())
                .build();
    }
}
