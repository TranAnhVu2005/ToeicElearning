package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageParams;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ExamSessionStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TestStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TestCatalogCategory;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.service.CloudinaryService;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.service.AuditEventService;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.*;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.service.AssignmentService;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.media.service.ExamMediaAssetService;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.notification.service.NotificationService;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.PartForUserResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.SubmitExamResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.TestHistoryResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.TestResultDetailResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.TestAccessResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.DictationContextResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.DictationResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.ExamSessionResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.mapper.PartForUserMapper;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request.*;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.ContextQuestionRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.AssignmentRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.ClassroomRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.ClassMemberRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.PartRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.QuestionRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.TestRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.TestResultRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.ExamSessionRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.TestEntitlementRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.PaymentTransactionRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.UserAnswerRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.TestComment;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.TestCommentRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.CommentResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request.CreateCommentRequest;

@Service
@RequiredArgsConstructor
public class ExamServiceImpl implements ExamService {
    private final TestRepository testRepository;
    private final PartRepository partRepository;
    private final ContextQuestionRepository contextQuestionRepository;
    private final QuestionRepository questionRepository;
    private final TestResultRepository testResultRepository;
    private final ExamSessionRepository examSessionRepository;
    private final ObjectMapper objectMapper;
    private final TestEntitlementRepository testEntitlementRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final UserRepository userRepository;
    private final AssignmentRepository assignmentRepository;
    private final ClassroomRepository classroomRepository;
    private final ClassMemberRepository classMemberRepository;
    private final AssignmentService assignmentService;
    private final ExamMediaAssetService examMediaAssetService;
    private final TestCommentRepository testCommentRepository;
    private final NotificationService notificationService;

    private final CloudinaryService cloudinaryService;
    private final AuditEventService auditEventService;

    private final PartForUserMapper partForUserMapper;


    public PageResponse<Test> getFullTest(PageParams pageParams, TestStatus status, TestCatalogCategory category, Boolean isVip){
        // Mặc định nếu không truyền status thì chỉ lấy các đề thi đã PUBLISHED, học viên không truy cập các bản nháp được
        if(status == null) {
            status = TestStatus.PUBLISHED;
        }

        if (category == null) category = TestCatalogCategory.ALL;
        String categoryName = category.name();
        String keyword = pageParams.getKeyWord() == null ? "" : pageParams.getKeyWord().trim();
        Page<Test> listTest = testRepository.findCatalogTests(status, categoryName, isVip, keyword, pageParams.toPageable());
        return PageResponse.of(listTest);
    }

    public PageResponse<Test> getAdminTests(PageParams pageParams, TestStatus status) {
        Page<Test> listTest;
        boolean hasKeyword = pageParams.getKeyWord() != null && !pageParams.getKeyWord().isBlank();
        if (hasKeyword) {
            listTest = testRepository.findByTitleTestContainingIgnoreCaseAndStatusAndClassroomIsNull(
                    pageParams.getKeyWord().trim(), status, pageParams.toPageable());
        } else {
            listTest = testRepository.findByStatusAndClassroomIsNull(status, pageParams.toPageable());
        }
        return PageResponse.of(listTest);
    }

    @Transactional(readOnly = true)
    public PageResponse<Test> getClassroomTests(User teacher, String classroomId, PageParams pageParams) {
        Classroom classroom = requireTeacherClassroom(teacher, classroomId);
        Page<Test> page = testRepository.findByClassroom_IdAndOwnerTeacher_Id(
                classroom.getId(), teacher.getId(), pageParams.toPageable());
        page.getContent().forEach(test -> test.setClassroomId(classroom.getId()));
        return PageResponse.of(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<Test> getAssignableTests(User teacher, String classroomId, PageParams pageParams) {
        Classroom classroom = requireTeacherClassroom(teacher, classroomId);
        Page<Test> tests = testRepository.findAssignableByStatus(
                TestStatus.PUBLISHED, classroom.getId(), teacher.getId(), pageParams.toPageable());
        tests.getContent().forEach(test -> test.setClassroomId(
                test.getClassroom() == null ? null : test.getClassroom().getId()));
        return PageResponse.of(tests);
    }

    @Transactional(readOnly = true)
    public Test getClassroomTestDetail(User teacher, String classroomId, String testId) {
        requireTeacherClassroom(teacher, classroomId);
        Test test = testRepository.findByIdAndClassroom_IdAndOwnerTeacher_Id(testId, classroomId, teacher.getId())
                .orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
        signTestMedia(test);
        return test;
    }

    @Transactional
    public void createClassroomTest(User teacher, String classroomId, CreateTestRequest request) {
        Classroom classroom = requireTeacherClassroom(teacher, classroomId);
        validateCoverImageUrl(request.getCoverImageUrl());
        validatePrivateAssets(teacher, request, null);
        TestStatus status = request.getStatus() == null ? TestStatus.DRAFT : request.getStatus();
        if (Boolean.TRUE.equals(request.getIsVip()) || request.getVipPriceVnd() != null || request.getClassroomId() != null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        if (status == TestStatus.PUBLISHED) validatePublishableTest(request);
        Test test = Test.builder().titleTest(request.getTitleTest()).coverImageUrl(request.getCoverImageUrl()).status(status).isVip(false)
                .classroom(classroom).ownerTeacher(teacher).build();
        Test savedTest = testRepository.save(test);
        saveTestDetail(savedTest, request);
        auditEventService.record(teacher, "CLASS_TEST_CREATED", "TEST", savedTest.getId(), "status=" + status);
    }

    @Transactional
    public void updateClassroomTest(User teacher, String classroomId, String testId, CreateTestRequest request) {
        Test test = requireOwnedClassroomTest(teacher, classroomId, testId);
        validateCoverImageUrl(request.getCoverImageUrl());
        validatePrivateAssets(teacher, request, test);
        if (Boolean.TRUE.equals(request.getIsVip()) || request.getVipPriceVnd() != null
                || request.getClassroomId() != null) throw new AppException(ErrorCode.VALIDATION_ERROR);
        TestStatus previousStatus = test.getStatus();
        TestStatus targetStatus = request.getStatus() == null ? previousStatus : request.getStatus();
        if (targetStatus == TestStatus.PUBLISHED) {
            validatePrivateAssets(teacher, request, test);
            validatePublishableTest(request);
        }
        String previousCoverImageUrl = test.getCoverImageUrl();
        test.setTitleTest(request.getTitleTest());
        if (Boolean.TRUE.equals(request.getClearCoverImage()) || !isBlank(request.getCoverImageUrl())) {
            test.setCoverImageUrl(Boolean.TRUE.equals(request.getClearCoverImage()) ? null : request.getCoverImageUrl().trim());
        }
        test.setStatus(targetStatus);
        deleteUnuseMedia(test, request);
        deleteReplacedCoverImageIfUnused(test.getId(), previousCoverImageUrl, test.getCoverImageUrl());
        upsertTestDetailInPlace(test, request);
        auditEventService.record(teacher, "CLASS_TEST_UPDATED", "TEST", test.getId(),
                "status=" + previousStatus + "->" + targetStatus);
    }

    @Transactional
    public void publishClassroomTest(User teacher, String classroomId, String testId) {
        Test test = requireOwnedClassroomTest(teacher, classroomId, testId);
        if (Boolean.TRUE.equals(test.getIsVip())) throw new AppException(ErrorCode.VALIDATION_ERROR);
        validatePrivateAssets(teacher, test);
        validatePublishableTest(test);
        test.setStatus(TestStatus.PUBLISHED);
        auditEventService.record(teacher, "CLASS_TEST_PUBLISHED", "TEST", test.getId(), "status=DRAFT->PUBLISHED");
    }

    @Transactional
    public void deleteClassroomTest(User teacher, String classroomId, String testId) {
        Test test = requireOwnedClassroomTest(teacher, classroomId, testId);
        if (testResultRepository.existsByTestId(testId) || assignmentRepository.existsByTest_Id(testId)
                || paymentTransactionRepository.existsByTest_Id(testId)
                || examSessionRepository.existsByTest_IdAndStatusAndExpiresAtAfter(
                        testId, ExamSessionStatus.ACTIVE, LocalDateTime.now())) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION);
        }
        examSessionRepository.deleteByTest_Id(testId);
        deleteTestMediaIfUnreferenced(test);
        auditEventService.record(teacher, "CLASS_TEST_DELETED", "TEST", test.getId(), "status=" + test.getStatus());
        testRepository.delete(test);
    }

    @Transactional(readOnly = true)
    public void requireClassroomTestAccess(Test test, User student) {
        Classroom classroom = test.getClassroom();
        if (classroom == null) return;
        if (student == null || !classMemberRepository
                .findByClassroom_IdAndStudent_Id(classroom.getId(), student.getId())
                .filter(member -> "APPROVED".equals(member.getStatus()))
                .isPresent()) throw new AppException(ErrorCode.TEST_ACCESS_REQUIRED);
    }

    private Classroom requireTeacherClassroom(User teacher, String classroomId) {
        return classroomRepository.findById(classroomId)
                .filter(classroom -> classroom.getTeacher() != null
                        && teacher != null && classroom.getTeacher().getId().equals(teacher.getId())
                        && teacher.getRole() != null && "ROLE_TEACHER".equals(teacher.getRole().getRoleName()))
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    private Test requireOwnedClassroomTest(User teacher, String classroomId, String testId) {
        requireTeacherClassroom(teacher, classroomId);
        return testRepository.findByIdAndClassroom_IdAndOwnerTeacher_Id(testId, classroomId, teacher.getId())
                .orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public Test getTestDetail(String testID, User currentUser){
        Test test = testRepository.findById(testID).orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
        requireTestAccess(test, currentUser);
        requireClassroomTestAccess(test, currentUser);
        signTestMedia(test);
        return test;
    }

    @Transactional(readOnly = true)
    public TestAccessResponse getTestAccess(String testID, User currentUser) {
        Test test = testRepository.findById(testID).orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
        boolean vip = Boolean.TRUE.equals(test.getIsVip());
        boolean hasEntitlement = vip && currentUser != null
                && testEntitlementRepository.existsByUser_IdAndTest_Id(currentUser.getId(), test.getId());
        if (test.getClassroom() != null) {
            if (vip || test.getStatus() != TestStatus.PUBLISHED || currentUser == null || classMemberRepository
                    .findByClassroom_IdAndStudent_Id(test.getClassroom().getId(), currentUser.getId())
                    .filter(member -> "APPROVED".equals(member.getStatus())).isEmpty()) {
                throw new AppException(ErrorCode.TEST_NOT_FOUND);
            }
        } else if (test.getStatus() != TestStatus.PUBLISHED && !hasEntitlement) {
            throw new AppException(ErrorCode.TEST_NOT_FOUND);
        }
        boolean hasAccess = !vip || hasEntitlement || test.getClassroom() != null;
        return TestAccessResponse.builder().testId(test.getId()).title(test.getTitleTest())
                .status(test.getStatus().name()).vip(vip).priceVnd(test.getVipPriceVnd())
                .hasAccess(hasAccess).build();
    }

    @Transactional(readOnly = true)
    public DictationResponseDTO getDictationData(String testID, User currentUser) {
        if (currentUser == null) throw new AppException(ErrorCode.UNAUTHORIZED);
        Test test = testRepository.findById(testID)
                .orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
        requireTestAccess(test, currentUser);
        requireClassroomTestAccess(test, currentUser);

        List<ContextQuestion> listeningContexts = test.getContextQuestions() == null
                ? List.of()
                : test.getContextQuestions().stream()
                    .filter(Objects::nonNull)
                    .filter(context -> {
                        int partNumber = contextPartNumber(context);
                        return partNumber >= 1 && partNumber <= 4;
                    })
                    .sorted(Comparator.comparing(ContextQuestion::getOrderIndex,
                            Comparator.nullsLast(Comparator.naturalOrder())))
                    .collect(Collectors.toList());
        signContextMedia(listeningContexts);

        List<DictationContextResponseDTO> contexts = listeningContexts.stream().map(context -> {
            int partNumber = contextPartNumber(context);
            return DictationContextResponseDTO.builder()
                    .id(context.getId())
                    .audioUrl(context.getAudioUrl())
                    .imageUrl(context.getImageUrl())
                    .paragraph(context.getParagraph())
                    .transcript(context.getTranscript())
                    .translation(context.getTranslation())
                    .orderIndex(context.getOrderIndex())
                    .partNumber(partNumber)
                    .build();
        }).collect(Collectors.toList());

        return DictationResponseDTO.builder()
                .testId(test.getId())
                .titleTest(test.getTitleTest())
                .contextQuestions(contexts)
                .build();
    }

    private int inferPartNumber(Integer orderIndex) {
        if (orderIndex == null || orderIndex < 1) return 0;
        if (orderIndex <= 6) return 1;
        if (orderIndex <= 31) return 2;
        if (orderIndex <= 70) return 3;
        if (orderIndex <= 100) return 4;
        return 0;
    }

    private int contextPartNumber(ContextQuestion context) {
        int partNumber = context.getPart() == null ? 0 : parsePartNumber(context.getPart().getNamePart());
        return partNumber >= 1 && partNumber <= 7 ? partNumber : inferPartNumber(context.getOrderIndex());
    }

    @Transactional(readOnly = true)
    public Test getAdminTestDetail(String testID) {
        Test test = testRepository.findById(testID).orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
        if (test.getClassroom() != null) throw new AppException(ErrorCode.TEST_NOT_FOUND);
        signTestMedia(test);
        return test;
    }

    @Transactional(readOnly = true)
    public PartForUserResponseDTO getPart(String testId, String partId, User currentUser){
        Test selectedTest = testRepository.findById(testId)
                .orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
        requireTestAccess(selectedTest, currentUser);
        requireClassroomTestAccess(selectedTest, currentUser);
        Part selectedPart = partRepository.findById(partId)
                .orElseThrow(() -> new AppException(ErrorCode.PART_NOT_FOUND));
        List<ContextQuestion> contextQuestionList = contextQuestionRepository.findByTestIdAndPartIdOrderByOrderIndexAsc(testId, partId);
        if (contextQuestionList.isEmpty()) {
            throw new AppException(ErrorCode.PART_NOT_FOUND);
        }
        signContextMedia(contextQuestionList);
        return partForUserMapper.toDTO(selectedTest, selectedPart, contextQuestionList );
    }

    private void signTestMedia(Test test) {
        if (test.getContextQuestions() != null) signContextMedia(test.getContextQuestions());
    }

    private void signContextMedia(List<ContextQuestion> contexts) {
        for (ContextQuestion context : contexts) {
            if ("authenticated".equals(context.getAudioDeliveryType()) && context.getAudioPublicId() != null) {
                context.setAudioUrl(cloudinaryService.createPrivateExamMediaDownload(
                        context.getAudioPublicId(), context.getAudioFormat(), "video").url());
            }
            if ("authenticated".equals(context.getImageDeliveryType()) && context.getImagePublicId() != null) {
                context.setImageUrl(cloudinaryService.createPrivateExamMediaDownload(
                        context.getImagePublicId(), context.getImageFormat(), "image").url());
            }
        }
    }



    @Transactional
    public void createFullTest(User admin, CreateTestRequest request){
        validateCoverImageUrl(request.getCoverImageUrl());
        validatePrivateAssets(admin, request, null);
        TestStatus status = request.getStatus() != null ? request.getStatus() : TestStatus.DRAFT;
        validateVipPricing(request);
        if (status == TestStatus.PUBLISHED) validatePublishableTest(request);
        Test test = Test.builder()
                .titleTest(request.getTitleTest())
                .coverImageUrl(request.getCoverImageUrl())
                .status(status)
                .isVip(Boolean.TRUE.equals(request.getIsVip()))
                .vipPriceVnd(Boolean.TRUE.equals(request.getIsVip()) ? request.getVipPriceVnd() : null)
                .build();
        Test savedTest = testRepository.save(test);
        saveTestDetail(savedTest, request);
        auditEventService.record(admin, "SYSTEM_TEST_CREATED", "TEST", savedTest.getId(), "status=" + status);
    }

    @Transactional
    public void updateFullTest(User admin, String testID,CreateTestRequest request)
    {
        validateCoverImageUrl(request.getCoverImageUrl());
        Test test = testRepository.findById(testID).orElseThrow(()-> new AppException(ErrorCode.TEST_NOT_FOUND));
        if (test.getClassroom() != null) throw new AppException(ErrorCode.TEST_NOT_FOUND);
        validatePrivateAssets(admin, request, test);
        TestStatus previousStatus = test.getStatus();
        TestStatus targetStatus = request.getStatus() != null ? request.getStatus() : previousStatus;
        validateVipPricing(request);
        if (targetStatus == TestStatus.PUBLISHED) {
            validatePrivateAssets(admin, request, test);
            validatePublishableTest(request);
        }
        String previousCoverImageUrl = test.getCoverImageUrl();
        test.setTitleTest(request.getTitleTest());
        if (Boolean.TRUE.equals(request.getClearCoverImage()) || !isBlank(request.getCoverImageUrl())) {
            test.setCoverImageUrl(Boolean.TRUE.equals(request.getClearCoverImage()) ? null : request.getCoverImageUrl().trim());
        }
        test.setIsVip(Boolean.TRUE.equals(request.getIsVip()));
        test.setVipPriceVnd(Boolean.TRUE.equals(request.getIsVip()) ? request.getVipPriceVnd() : null);
        if(request.getStatus() != null) {
            test.setStatus(request.getStatus());
        }
        testRepository.save(test);
        deleteUnuseMedia(test, request);
        deleteReplacedCoverImageIfUnused(test.getId(), previousCoverImageUrl, test.getCoverImageUrl());
        upsertTestDetailInPlace(test, request);
        auditEventService.record(admin, "SYSTEM_TEST_UPDATED", "TEST", test.getId(),
                "status=" + previousStatus + "->" + targetStatus);
    }

    @Override
    @Transactional
    public void updateFullTestMetadata(User admin, String testID, TestMetadataRequest request) {
        String title = request.getTitleTest() == null ? "" : request.getTitleTest().trim();
        if (title.isBlank() || title.length() > 255) throw new AppException(ErrorCode.VALIDATION_ERROR);
        validateCoverImageUrl(request.getCoverImageUrl());
        Test test = testRepository.findForUpdateById(testID)
                .orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
        if (test.getClassroom() != null) throw new AppException(ErrorCode.TEST_NOT_FOUND);
        if (request.getIsVip() != null || request.getVipPriceVnd() != null) {
            validateVipPricing(request.getIsVip(), request.getVipPriceVnd());
            test.setIsVip(Boolean.TRUE.equals(request.getIsVip()));
            test.setVipPriceVnd(Boolean.TRUE.equals(request.getIsVip()) ? request.getVipPriceVnd() : null);
        }
        if (request.getStatus() != null) {
            validatePrivateAssets(admin, test);
            if (request.getStatus() == TestStatus.PUBLISHED && test.getStatus() != TestStatus.PUBLISHED) {
                validatePublishableTest(test);
            }
            test.setStatus(request.getStatus());
        }
        String previousCoverImageUrl = test.getCoverImageUrl();
        test.setTitleTest(title);
        if (Boolean.TRUE.equals(request.getClearCoverImage())) {
            test.setCoverImageUrl(null);
        } else if (!isBlank(request.getCoverImageUrl())) {
            test.setCoverImageUrl(request.getCoverImageUrl().trim());
        }
        testRepository.save(test);
        deleteReplacedCoverImageIfUnused(test.getId(), previousCoverImageUrl, test.getCoverImageUrl());
        auditEventService.record(admin, "SYSTEM_TEST_METADATA_UPDATED", "TEST", test.getId(), "title/cover/status");
    }

    private void deleteReplacedCoverImageIfUnused(String testId, String previousCoverUrl, String currentCoverUrl) {
        if (previousCoverUrl == null || previousCoverUrl.isBlank()
                || Objects.equals(previousCoverUrl, currentCoverUrl)) {
            return;
        }
        if (testId == null || !testRepository.existsByCoverImageUrlAndIdNot(previousCoverUrl, testId)) {
            cloudinaryService.deleteFileByUrl(previousCoverUrl);
        }
    }

    private void validateCoverImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return;
        try {
            URI uri = URI.create(imageUrl.trim());
            String path = uri.getPath();
            if (uri.getUserInfo() != null || path == null) {
                throw new AppException(ErrorCode.VALIDATION_ERROR);
            }
            boolean validLocalCover = (uri.getScheme() == null
                    || "http".equalsIgnoreCase(uri.getScheme())
                    || "https".equalsIgnoreCase(uri.getScheme()))
                    && path.matches("/api/media/local/Resource/toeic-learning/exams/[A-Za-z0-9_-]{1,100}/covers/[A-Za-z0-9_-]+\\.(jpg|png)");
            boolean validCloudinaryCover = "https".equalsIgnoreCase(uri.getScheme())
                    && "res.cloudinary.com".equalsIgnoreCase(uri.getHost())
                    && path.matches("/[^/]+/image/upload/(?:v[0-9]+/)?(?:Resource/toeic-learning/exams/[A-Za-z0-9_-]{1,100}/covers/)?[A-Za-z0-9/_.-]+");
            if (!validLocalCover && !validCloudinaryCover) {
                throw new AppException(ErrorCode.VALIDATION_ERROR);
            }
        } catch (IllegalArgumentException exception) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
    }

    private void validateVipPricing(CreateTestRequest request) {
        validateVipPricing(request.getIsVip(), request.getVipPriceVnd());
    }

    private void validateVipPricing(Boolean isVip, BigDecimal price) {
        if (Boolean.TRUE.equals(isVip)) {
            if (price == null || price.scale() > 0 || price.compareTo(BigDecimal.ONE) < 0
                    || price.compareTo(new BigDecimal("99999999")) > 0) {
                throw new AppException(ErrorCode.VALIDATION_ERROR);
            }
        } else if (price != null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
    }

    public void deleteUnuseMedia(Test test, CreateTestRequest request){
        Set<String> newUrls = new HashSet<String>();
        if(request.getParts()!=null){
            for (TestPartRequest partRequest : request.getParts()) {
                if (partRequest.getContextQuestions() != null) {
                    for (ContextQuestionRequest cqRequest : partRequest.getContextQuestions()) {
                        if (cqRequest.getAudioUrl() != null && !cqRequest.getAudioUrl().isBlank()) {
                            newUrls.add(cqRequest.getAudioUrl().trim());
                        }
                        if (cqRequest.getImageUrl() != null && !cqRequest.getImageUrl().isBlank()) {
                            newUrls.add(cqRequest.getImageUrl().trim());
                        }
                    }
                }
            }
        }

        if (test.getContextQuestions() != null) {
            for (ContextQuestion oldCq : test.getContextQuestions()) {
                if (contextReferencedByTestResult(oldCq.getId())) {
                    continue;
                }
                // Nếu có link audio cũ mà không còn trong danh sách mới -> Xóa trên Cloudinary
                if (oldCq.getAudioPublicId() != null && !oldCq.getAudioPublicId().isBlank()
                        && cqRequestMediaReplaced(request, oldCq.getAudioPublicId(), true)
                        && !contextQuestionRepository.existsByAudioPublicIdAndIdNot(
                                oldCq.getAudioPublicId(), oldCq.getId())) {
                    cloudinaryService.deletePrivateExamMedia(oldCq.getAudioPublicId(), "video");
                    examMediaAssetService.forget(oldCq.getAudioPublicId());
                }
                if (oldCq.getImagePublicId() != null && !oldCq.getImagePublicId().isBlank()
                        && cqRequestMediaReplaced(request, oldCq.getImagePublicId(), false)
                        && !contextQuestionRepository.existsByImagePublicIdAndIdNot(
                                oldCq.getImagePublicId(), oldCq.getId())) {
                    cloudinaryService.deletePrivateExamMedia(oldCq.getImagePublicId(), "image");
                    examMediaAssetService.forget(oldCq.getImagePublicId());
                }
                if (oldCq.getAudioUrl() != null && !oldCq.getAudioUrl().isBlank()
                        && !newUrls.contains(oldCq.getAudioUrl().trim())
                        && !contextQuestionRepository.existsByAudioUrlAndIdNot(oldCq.getAudioUrl(), oldCq.getId())) {
                    cloudinaryService.deleteFileByUrl(oldCq.getAudioUrl());
                }
                // Nếu có link ảnh cũ mà không còn trong danh sách mới -> Xóa trên Cloudinary
                if (oldCq.getImageUrl() != null && !oldCq.getImageUrl().isBlank()
                        && !newUrls.contains(oldCq.getImageUrl().trim())
                        && !contextQuestionRepository.existsByImageUrlAndIdNot(oldCq.getImageUrl(), oldCq.getId())) {
                    cloudinaryService.deleteFileByUrl(oldCq.getImageUrl());
                }
            }
        }
    }

    private boolean cqRequestMediaReplaced(CreateTestRequest request, String publicId, boolean audio) {
        return request.getParts() == null || request.getParts().stream().filter(Objects::nonNull)
                .flatMap(part -> part.getContextQuestions() == null ? java.util.stream.Stream.empty()
                        : part.getContextQuestions().stream())
                .filter(Objects::nonNull)
                .noneMatch(context -> publicId.equals(audio ? context.getAudioPublicId() : context.getImagePublicId()));
    }

    @Transactional
    public void publishTest(User admin, String testID) {
        Test test = testRepository.findById(testID).orElseThrow(()-> new AppException(ErrorCode.TEST_NOT_FOUND));
        if (test.getClassroom() != null) throw new AppException(ErrorCode.TEST_NOT_FOUND);
        validatePrivateAssets(admin, test);
        validatePublishableTest(test);
        test.setStatus(TestStatus.PUBLISHED);
        testRepository.save(test);
        auditEventService.record(admin, "SYSTEM_TEST_PUBLISHED", "TEST", test.getId(),
                "status=" + TestStatus.DRAFT + "->" + TestStatus.PUBLISHED);
    }

    private void validatePublishableTest(CreateTestRequest request) {
        if (request.getParts() == null || request.getParts().isEmpty()) {
            throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
        }

        Set<Integer> requestedParts = new HashSet<>();
        Set<Integer> questionNumbers = new HashSet<>();
        for (TestPartRequest part : request.getParts()) {
            if (part == null) throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
            int partNumber = part.getPartNumber();
            if (partNumber < 1 || partNumber > 7 || !requestedParts.add(partNumber)
                    || part.getContextQuestions() == null || part.getContextQuestions().isEmpty()) {
                throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
            }
            int expectedQuestionNumber = getStartingQuestionNumber(partNumber, 1);
            int endingQuestionNumber = getEndingQuestionNumber(partNumber);
            for (ContextQuestionRequest context : part.getContextQuestions()) {
                if (context == null || context.getQuestions() == null || context.getQuestions().isEmpty()) {
                    throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
                }
                if (partNumber == 7) {
                    validatePart7Grouping(expectedQuestionNumber, context.getQuestions().size(), context.getParagraph());
                }
                String audioUrl = isPrivateAsset(context.getAudioPublicId(), context.getAudioFormat(), context.getAudioDeliveryType())
                        ? "authenticated" : context.getAudioUrl();
                String imageUrl = isPrivateAsset(context.getImagePublicId(), context.getImageFormat(), context.getImageDeliveryType())
                        ? "authenticated" : context.getImageUrl();
                validatePublishableContext(partNumber, audioUrl, imageUrl,
                        context.getParagraph(), context.getQuestions().size());
                for (QuestionRequest question : context.getQuestions()) {
                    if (question == null) throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
                    if (expectedQuestionNumber > endingQuestionNumber) {
                        throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
                    }
                    int suppliedQuestionNumber = question.getQuestionNumber() == null || question.getQuestionNumber() <= 0
                            ? expectedQuestionNumber : question.getQuestionNumber();
                    if (!questionNumbers.add(suppliedQuestionNumber)) {
                        throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
                    }
                    validatePublishableQuestion(partNumber, question.getQuestionContent(), question.getOptionA(),
                            question.getOptionB(), question.getOptionC(), question.getOptionD(), question.getCorrectAnswer());
                    expectedQuestionNumber++;
                }
            }
        }
    }

    private void validatePublishableTest(Test test) {
        List<ContextQuestion> contexts = test.getContextQuestions();
        if (contexts == null || contexts.isEmpty()) throw new AppException(ErrorCode.TEST_CONTENT_INVALID);

        Map<Integer, List<ContextQuestion>> contextsByPart = new TreeMap<>();
        for (ContextQuestion context : contexts) {
            if (context == null) throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
            int partNumber = contextPartNumber(context);
            if (partNumber < 1 || partNumber > 7) throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
            contextsByPart.computeIfAbsent(partNumber, ignored -> new ArrayList<>()).add(context);
        }

        Set<Integer> questionNumbers = new HashSet<>();
        for (Map.Entry<Integer, List<ContextQuestion>> partEntry : contextsByPart.entrySet()) {
            int partNumber = partEntry.getKey();
            int expectedQuestionNumber = getStartingQuestionNumber(partNumber, 1);
            int endingQuestionNumber = getEndingQuestionNumber(partNumber);
            List<ContextQuestion> partContexts = partEntry.getValue();
            partContexts.sort(Comparator.comparing(ContextQuestion::getOrderIndex,
                    Comparator.nullsLast(Comparator.naturalOrder())));
            for (ContextQuestion context : partContexts) {
                List<Question> questions = context.getQuestions();
                if (questions == null || questions.isEmpty()) throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
                if (partNumber == 7) {
                    validatePart7Grouping(expectedQuestionNumber, questions.size(), context.getParagraph());
                }
                String audioUrl = isPrivateAsset(context.getAudioPublicId(), context.getAudioFormat(), context.getAudioDeliveryType())
                        ? "authenticated" : context.getAudioUrl();
                String imageUrl = isPrivateAsset(context.getImagePublicId(), context.getImageFormat(), context.getImageDeliveryType())
                        ? "authenticated" : context.getImageUrl();
                validatePublishableContext(partNumber, audioUrl, imageUrl,
                        context.getParagraph(), questions.size());
                List<Question> orderedQuestions = new ArrayList<>(questions);
                orderedQuestions.sort(Comparator.comparing(question -> question == null ? null : question.getQuestionNumber(),
                        Comparator.nullsLast(Comparator.naturalOrder())));
                for (Question question : orderedQuestions) {
                    if (expectedQuestionNumber > endingQuestionNumber
                            || question == null || question.getQuestionNumber() == null
                            || !questionNumbers.add(question.getQuestionNumber())) {
                        throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
                    }
                    validatePublishableQuestion(partNumber, question.getQuestionContent(), question.getOptionA(),
                            question.getOptionB(), question.getOptionC(), question.getOptionD(),
                            String.valueOf(question.getCorrectAnswer()));
                    expectedQuestionNumber++;
                }
            }
        }
    }

    private void validatePart7Grouping(int startQuestionNumber, int questionCount, String paragraph) {
        if (questionCount < 1 || questionCount > 5 || isBlank(paragraph)) {
            throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
        }
        Pattern separator = Pattern.compile("(?im)^[ \\t]*---[ \\t]*(?:BÀI ĐỌC|VĂN BẢN|PASSAGE)[ \\t]*([0-9]+)[ \\t]*---[ \\t]*$");
        Matcher matcher = separator.matcher(paragraph);
        int contentStart = 0;
        while (matcher.find()) {
            if (paragraph.substring(contentStart, matcher.start()).isBlank()) {
                throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
            }
            contentStart = matcher.end();
        }
        if (paragraph.substring(contentStart).isBlank()) {
            throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
        }
    }

    private void validatePrivateAssets(User actor, CreateTestRequest request, Test existingTest) {
        if (request == null || request.getParts() == null) return;
        for (TestPartRequest part : request.getParts()) {
            if (part == null || part.getContextQuestions() == null) continue;
            for (ContextQuestionRequest context : part.getContextQuestions()) {
                if (context == null) continue;
                validatePrivateAsset(actor, context.getAudioPublicId(), context.getAudioFormat(),
                        context.getAudioDeliveryType(), "video", existingTest);
                validatePrivateAsset(actor, context.getImagePublicId(), context.getImageFormat(),
                        context.getImageDeliveryType(), "image", existingTest);
            }
        }
    }

    private void validatePrivateAssets(User actor, Test test) {
        if (test.getContextQuestions() == null) return;
        for (ContextQuestion context : test.getContextQuestions()) {
            validatePrivateAsset(actor, context.getAudioPublicId(), context.getAudioFormat(),
                    context.getAudioDeliveryType(), "video", test);
            validatePrivateAsset(actor, context.getImagePublicId(), context.getImageFormat(),
                    context.getImageDeliveryType(), "image", test);
        }
    }

    private void validatePrivateAsset(User actor, String publicId, String format, String deliveryType,
                                      String resourceType, Test existingTest) {
        boolean hasAnyMetadata = !isBlank(publicId) || !isBlank(format) || !isBlank(deliveryType);
        if (!hasAnyMetadata) return;
        if (!isPrivateAsset(publicId, format, deliveryType)) {
            throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
        }
        if (existingTest != null && hasBoundAsset(existingTest, publicId, format, deliveryType, resourceType)) {
            return;
        }
        if (!examMediaAssetService.canUse(actor, publicId, format, deliveryType, resourceType)) {
            throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
        }
    }

    private boolean hasBoundAsset(Test test, String publicId, String format, String deliveryType,
                                  String resourceType) {
        if (test.getContextQuestions() == null) return false;
        return test.getContextQuestions().stream().anyMatch(context ->
                "video".equals(resourceType)
                        ? Objects.equals(publicId, context.getAudioPublicId())
                        && Objects.equals(format, context.getAudioFormat())
                        && Objects.equals(deliveryType, context.getAudioDeliveryType())
                        : Objects.equals(publicId, context.getImagePublicId())
                        && Objects.equals(format, context.getImageFormat())
                        && Objects.equals(deliveryType, context.getImageDeliveryType()));
    }

    private boolean isPrivateAsset(String publicId, String format, String deliveryType) {
        return publicId != null && publicId.matches("Resource/toeic-learning/exams/[A-Za-z0-9/_-]{1,180}")
                && format != null && format.matches("[A-Za-z0-9]{1,12}")
                && "authenticated".equals(deliveryType);
    }

    private void validatePublishableContext(int partNumber, String audioUrl, String imageUrl,
                                             String paragraph, int questionCount) {
        if (questionCount < 1) {
            throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
        }
        if ((partNumber == 1 || partNumber == 2) && questionCount != 1) {
            throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
        }
        if ((partNumber == 3 || partNumber == 4) && questionCount != 3) {
            throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
        }
        if ((partNumber == 6 || partNumber == 7) && isBlank(paragraph)) {
            throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
        }
    }

    private void validatePublishableQuestion(int partNumber, String content, String optionA, String optionB,
                                               String optionC, String optionD, String correctAnswer) {
        if (partNumber >= 3 && ((partNumber != 6 && isBlank(content)) || isBlank(optionA) || isBlank(optionB)
                || isBlank(optionC) || isBlank(optionD))) {
            throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
        }
        if (isBlank(correctAnswer) || correctAnswer.trim().length() != 1) {
            throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
        }
        char answer = Character.toUpperCase(correctAnswer.trim().charAt(0));
        if (answer < 'A' || answer > 'D' || (partNumber == 2 && answer == 'D')) {
            throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private int parsePartNumber(String name) {
        if (name == null) return 0;
        try {
            return Integer.parseInt(name.replaceAll("[^0-9]", ""));
        } catch (NumberFormatException ignored) {
            return 0;
        }
    }

    @Transactional
    public void draftTest(User admin, String testID) {
        Test test = testRepository.findById(testID).orElseThrow(()-> new AppException(ErrorCode.TEST_NOT_FOUND));
        if (test.getClassroom() != null) throw new AppException(ErrorCode.TEST_NOT_FOUND);
        TestStatus previousStatus = test.getStatus();
        test.setStatus(TestStatus.DRAFT);
        testRepository.save(test);
        auditEventService.record(admin, "SYSTEM_TEST_DRAFTED", "TEST", test.getId(),
                "status=" + previousStatus + "->" + TestStatus.DRAFT);
    }

    @Transactional
    public boolean deleteFullTest(User admin, String testID){
        Test test = testRepository.findById(testID).orElseThrow(()-> new AppException(ErrorCode.TEST_NOT_FOUND));
        if (test.getClassroom() != null) throw new AppException(ErrorCode.TEST_NOT_FOUND);
        TestStatus previousStatus = test.getStatus();
        boolean hasReferences = testResultRepository.existsByTestId(testID)
                || paymentTransactionRepository.existsByTest_Id(testID)
                || assignmentRepository.existsByTest_Id(testID)
                || examSessionRepository.existsByTest_IdAndStatusAndExpiresAtAfter(
                        testID, ExamSessionStatus.ACTIVE, LocalDateTime.now());
        if (hasReferences) {
            test.setStatus(TestStatus.DRAFT);
            testRepository.save(test);
            auditEventService.record(admin, "SYSTEM_TEST_ARCHIVED", "TEST", test.getId(),
                    "status=" + previousStatus + "->DRAFT; reason=referenced");
            return true;
        }
        examSessionRepository.deleteByTest_Id(testID);
        deleteTestMediaIfUnreferenced(test);
        auditEventService.record(admin, "SYSTEM_TEST_DELETED", "TEST", test.getId(), "status=" + previousStatus);
        testRepository.delete(test);
        return false;
    }

    private void deleteTestMediaIfUnreferenced(Test test) {
        if (test.getId() != null && test.getCoverImageUrl() != null && !test.getCoverImageUrl().isBlank()
                && !testRepository.existsByCoverImageUrlAndIdNot(test.getCoverImageUrl(), test.getId())) {
            cloudinaryService.deleteFileByUrl(test.getCoverImageUrl());
        }
        if (test.getContextQuestions() == null || test.getId() == null) return;
        Set<String> handledAudio = new HashSet<>();
        Set<String> handledImages = new HashSet<>();
        for (ContextQuestion context : test.getContextQuestions()) {
            String audioPublicId = context.getAudioPublicId();
            if (isPrivateAsset(audioPublicId, context.getAudioFormat(), context.getAudioDeliveryType())
                    && handledAudio.add(audioPublicId)
                    && contextQuestionRepository.countByAudioPublicIdAndTest_IdNot(audioPublicId, test.getId()) == 0) {
                cloudinaryService.deletePrivateExamMedia(audioPublicId, "video");
                examMediaAssetService.forget(audioPublicId);
            } else if (!isPrivateAsset(audioPublicId, context.getAudioFormat(), context.getAudioDeliveryType())
                    && context.getAudioUrl() != null && !context.getAudioUrl().isBlank()
                    && handledAudio.add(context.getAudioUrl())
                    && contextQuestionRepository.countByAudioUrlAndTest_IdNot(context.getAudioUrl(), test.getId()) == 0) {
                cloudinaryService.deleteFileByUrl(context.getAudioUrl());
            }

            String imagePublicId = context.getImagePublicId();
            if (isPrivateAsset(imagePublicId, context.getImageFormat(), context.getImageDeliveryType())
                    && handledImages.add(imagePublicId)
                    && contextQuestionRepository.countByImagePublicIdAndTest_IdNot(imagePublicId, test.getId()) == 0) {
                cloudinaryService.deletePrivateExamMedia(imagePublicId, "image");
                examMediaAssetService.forget(imagePublicId);
            } else if (!isPrivateAsset(imagePublicId, context.getImageFormat(), context.getImageDeliveryType())
                    && context.getImageUrl() != null && !context.getImageUrl().isBlank()
                    && handledImages.add(context.getImageUrl())
                    && contextQuestionRepository.countByImageUrlAndTest_IdNot(context.getImageUrl(), test.getId()) == 0) {
                cloudinaryService.deleteFileByUrl(context.getImageUrl());
            }
        }
    }

    private boolean contextReferencedByTestResult(String contextQuestionId) {
        return contextQuestionId != null && userAnswerRepository.existsByQuestionContextQuestionId(contextQuestionId);
    }

    @Override
    @Transactional
    public SubmitExamResponseDTO submitExam(User currentUser, SubmitExamAnswer request) {
        User lockedUser = userRepository.findByIdWithRoleForUpdate(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        TestResult previousSubmission = testResultRepository
                .findBySubmissionKeyAndUserId(request.getSubmissionKey(), lockedUser.getId()).orElse(null);
        if (previousSubmission != null) {
            String requestedAssignmentId = request.getAssignmentId() == null || request.getAssignmentId().isBlank()
                    ? null : request.getAssignmentId();
            String previousAssignmentId = previousSubmission.getAssignment() == null
                    ? null : previousSubmission.getAssignment().getId();
            String requestedSourceId = request.getSourceResultId() == null || request.getSourceResultId().isBlank()
                    ? null : request.getSourceResultId();
            String previousSourceId = previousSubmission.getSourceResult() == null
                    ? null : previousSubmission.getSourceResult().getId();
            if (previousSubmission.getTest() == null || !request.getTestId().equals(previousSubmission.getTest().getId())
                    || !Objects.equals(requestedAssignmentId, previousAssignmentId)
                    || !Objects.equals(requestedSourceId, previousSourceId)) {
                throw new AppException(ErrorCode.VALIDATION_ERROR);
            }
            return toSubmitResponse(previousSubmission, lockedUser);
        }

        ExamSession session = examSessionRepository.findOwnedForUpdate(request.getSessionId(), lockedUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.TEST_ACCESS_REQUIRED));
        LocalDateTime submittedAt = LocalDateTime.now();
        validateSessionForSubmit(session, lockedUser, submittedAt);
        boolean finalizationGrace = session.getDurationLimitSeconds() != null
                && !submittedAt.isBefore(session.getStartedAt().plusSeconds(session.getDurationLimitSeconds()))
                && !submittedAt.isAfter(session.getStartedAt().plusSeconds(session.getDurationLimitSeconds()).plusMinutes(2));
        if (session.getStatus() != ExamSessionStatus.ACTIVE || !session.getTest().getId().equals(request.getTestId())
                || !Objects.equals(session.getAssignment() == null ? null : session.getAssignment().getId(), request.getAssignmentId())
                || !Objects.equals(session.getSourceResult() == null ? null : session.getSourceResult().getId(), request.getSourceResultId())
                || (session.getExpiresAt().isBefore(submittedAt) && !finalizationGrace)) {
            throw new AppException(ErrorCode.TEST_ACCESS_REQUIRED);
        }

        Test test = testRepository.findById(request.getTestId())
                .orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
        requireTestAccess(test, lockedUser);
        requireClassroomTestAccess(test, lockedUser);

        Set<String> selectedPartIds = new LinkedHashSet<>();
        if (request.getPartId() != null && !request.getPartId().isBlank()) selectedPartIds.add(request.getPartId());
        if (request.getPartIds() != null) selectedPartIds.addAll(request.getPartIds());
        if (request.getPartId() != null && request.getPartIds() != null && request.getPartIds().contains(request.getPartId())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        Set<Integer> selectedPartNumbers = request.getPartNumbers() == null ? Set.of() : new LinkedHashSet<>(request.getPartNumbers());
        if (selectedPartNumbers.size() != (request.getPartNumbers() == null ? 0 : request.getPartNumbers().size())
                || selectedPartNumbers.stream().anyMatch(number -> number == null || number < 1 || number > 7)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        boolean assignmentSubmission = request.getAssignmentId() != null && !request.getAssignmentId().isBlank();
        if (assignmentSubmission && (!selectedPartIds.isEmpty() || !selectedPartNumbers.isEmpty())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }

        List<ContextQuestion> contexts = test.getContextQuestions() == null ? List.of() : test.getContextQuestions();
        if (contexts.isEmpty() || contexts.stream().anyMatch(context -> context == null || context.getQuestions() == null || context.getQuestions().isEmpty())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        List<Question> allQuestions = contexts.stream()
                .filter(Objects::nonNull)
                .flatMap(context -> context.getQuestions() == null ? java.util.stream.Stream.empty() : context.getQuestions().stream())
                .sorted(Comparator.comparing(Question::getQuestionNumber, Comparator.nullsLast(Integer::compareTo)))
                .collect(Collectors.toList());
        Set<String> actualPartIds = contexts.stream().map(ContextQuestion::getPart).filter(Objects::nonNull)
                .map(Part::getId).collect(Collectors.toSet());
        if (!actualPartIds.containsAll(selectedPartIds)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }

        TestResult sourceResult = null;
        List<Question> targetQuestions;
        if (request.getSourceResultId() != null && !request.getSourceResultId().isBlank()) {
            if (!selectedPartIds.isEmpty() || !selectedPartNumbers.isEmpty()
                    || (request.getAssignmentId() != null && !request.getAssignmentId().isBlank())) {
                throw new AppException(ErrorCode.VALIDATION_ERROR);
            }
            sourceResult = testResultRepository.findByIdAndUserId(request.getSourceResultId(), lockedUser.getId())
                    .filter(result -> result.getTest() != null && test.getId().equals(result.getTest().getId()))
                    .orElseThrow(() -> new AppException(ErrorCode.TEST_RESULT_NOT_FOUND));
            Set<String> wrongQuestionIds = userAnswerRepository.findByTestResultIdWithDetails(sourceResult.getId())
                    .stream().filter(answer -> !Boolean.TRUE.equals(answer.getIsCorrect()))
                    .map(answer -> answer.getQuestion().getId()).collect(Collectors.toSet());
            Set<String> requestedQuestionIds = request.getQuestionIds() == null || request.getQuestionIds().isEmpty()
                    ? wrongQuestionIds : new LinkedHashSet<>(request.getQuestionIds());
            if (requestedQuestionIds.isEmpty()
                    || requestedQuestionIds.size() != (request.getQuestionIds() == null || request.getQuestionIds().isEmpty()
                        ? wrongQuestionIds.size() : request.getQuestionIds().size())
                    || !wrongQuestionIds.containsAll(requestedQuestionIds)) {
                throw new AppException(ErrorCode.VALIDATION_ERROR);
            }
            targetQuestions = allQuestions.stream().filter(question -> requestedQuestionIds.contains(question.getId()))
                    .collect(Collectors.toList());
            if (targetQuestions.size() != requestedQuestionIds.size()) {
                throw new AppException(ErrorCode.VALIDATION_ERROR);
            }
        } else {
            if (request.getQuestionIds() != null && !request.getQuestionIds().isEmpty()) {
                throw new AppException(ErrorCode.VALIDATION_ERROR);
            }
            targetQuestions = allQuestions.stream()
                    .filter(question -> {
                        if (selectedPartIds.isEmpty() && selectedPartNumbers.isEmpty()) return true;
                        ContextQuestion context = question.getContextQuestion();
                        Part questionPart = context == null ? null : context.getPart();
                        return (questionPart != null && selectedPartIds.contains(questionPart.getId()))
                                || selectedPartNumbers.contains(getPartNumber(question));
                    })
                    .collect(Collectors.toList());
        }
        if (targetQuestions.isEmpty() || targetQuestions.stream().anyMatch(question -> question.getCorrectAnswer() < 'A' || question.getCorrectAnswer() > 'D')) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        boolean requestHasPartScope = !selectedPartIds.isEmpty() || !selectedPartNumbers.isEmpty();
        boolean expectedTimed = assignmentSubmission || (!requestHasPartScope && sourceResult == null);
        if ((session.getDurationLimitSeconds() != null) != expectedTimed) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }

        Set<String> allowedQuestionIds = targetQuestions.stream().map(Question::getId).collect(Collectors.toSet());
        if (!new HashSet<>(readSessionQuestionIds(session)).equals(allowedQuestionIds)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        Map<String, Character> answerMap = readSessionAnswers(session);
        boolean timeUp = session.getDurationLimitSeconds() != null
                && !submittedAt.isBefore(session.getStartedAt().plusSeconds(session.getDurationLimitSeconds()));
        if (!timeUp) {
            answerMap = validatedAnswerMap(request.getAnswers(), allowedQuestionIds);
            session.setAnswersJson(writeJson(answerMap));
            session.setLastSavedAt(submittedAt);
        }
        if (!allowedQuestionIds.containsAll(answerMap.keySet())) throw new AppException(ErrorCode.VALIDATION_ERROR);


        int correctCount = 0, listeningCorrect = 0, listeningTotal = 0, readingCorrect = 0, readingTotal = 0;
        List<UserAnswer> answersToSave = new ArrayList<>();
        for (Question question : targetQuestions) {
            int partNumber = getPartNumber(question);
            boolean listening = partNumber >= 1 && partNumber <= 4;
            if (!listening && partNumber < 5) throw new AppException(ErrorCode.VALIDATION_ERROR);
            if (listening) listeningTotal++; else readingTotal++;
            Character selected = answerMap.get(question.getId());
            boolean correct = selected != null && Character.toUpperCase(question.getCorrectAnswer()) == selected;
            if (correct) {
                correctCount++;
                if (listening) listeningCorrect++; else readingCorrect++;
            }
            answersToSave.add(UserAnswer.builder().question(question).selectedAnswer(selected).isCorrect(correct).build());
        }

        boolean fullLengthForm = sourceResult == null && selectedPartIds.isEmpty() && selectedPartNumbers.isEmpty()
                && targetQuestions.size() == 200 && listeningTotal == 100 && readingTotal == 100;
        int listeningScore = fullLengthForm ? estimateListeningScore(listeningCorrect) : listeningCorrect;
        int readingScore = fullLengthForm ? estimateReadingScore(readingCorrect) : readingCorrect;
        int totalScore = fullLengthForm ? listeningScore + readingScore : correctCount;
        String scoreType = fullLengthForm ? "ESTIMATED_SCALED" : "RAW_CORRECT_COUNT";
        Part selectedPart = selectedPartIds.size() == 1
                ? partRepository.findById(selectedPartIds.iterator().next()).orElse(null) : null;

        TestResult result = TestResult.builder().submissionKey(request.getSubmissionKey())
                .user(lockedUser).test(test).part(selectedPart)
                .totalTime(serverElapsedSeconds(session, submittedAt)).totalCount(targetQuestions.size()).correctCount(correctCount)
                .listeningScore(listeningScore).readingScore(readingScore).totalScore(totalScore).scoreType(scoreType)
                .sourceResult(sourceResult).build();
        if (request.getAssignmentId() != null && !request.getAssignmentId().isBlank()) {
            assignmentService.attachSubmission(lockedUser, request.getAssignmentId(), test.getId(), result, submittedAt);
        }
        TestResult savedResult = testResultRepository.save(result);
        session.setStatus(ExamSessionStatus.SUBMITTED);
        session.setTestResult(savedResult);
        session.setAnswersJson("{}");
        session.setTargetQuestionIds("[]");
        answersToSave.forEach(answer -> answer.setTestResult(savedResult));
        userAnswerRepository.saveAll(answersToSave);
        updateUserProgressAfterSubmit(lockedUser, submittedAt.toLocalDate(), fullLengthForm, totalScore);

        String examResultTitle = fullLengthForm
                ? "Kết quả Full Test: " + test.getTitleTest()
                : "Hoàn thành bài luyện tập: " + test.getTitleTest();
        String examResultContent = fullLengthForm
                ? "Bạn đạt " + totalScore + "/990 điểm ước tính (Nghe: " + listeningScore
                        + " · Đọc: " + readingScore + " · Đúng " + correctCount + "/200 câu). Nhấn để xem chi tiết đáp án và lời giải."
                : "Bạn trả lời đúng " + correctCount + "/" + targetQuestions.size()
                        + " câu. Nhấn để xem lại chi tiết đáp án, transcript và lời giải.";
        notificationService.createNotification(
                lockedUser,
                examResultTitle,
                examResultContent,
                "EXAM_RESULT",
                "/results/" + savedResult.getId()
        );

        Assignment submittedAssignment = savedResult.getAssignment();
        if (submittedAssignment != null && submittedAssignment.getClassroom() != null
                && submittedAssignment.getClassroom().getTeacher() != null) {
            String timingLabel = Boolean.TRUE.equals(savedResult.getAssignmentLate()) ? "Nộp trễ hạn" : "Đúng hạn";
            String scoreLabel = fullLengthForm
                    ? totalScore + "/990 điểm"
                    : "Đúng " + correctCount + "/" + targetQuestions.size() + " câu";
            notificationService.createNotification(
                    submittedAssignment.getClassroom().getTeacher(),
                    "Học viên vừa nộp bài tập lớp học",
                    "Học viên " + lockedUser.getUserName() + " đã nộp bài tập \"" + submittedAssignment.getTitle()
                            + "\" trong lớp \"" + submittedAssignment.getClassroom().getClassName()
                            + "\" (" + timingLabel + " · Kết quả: " + scoreLabel + ").",
                    "ASSIGNMENT_SUBMITTED",
                    "/classrooms"
            );
        }

        return toSubmitResponse(savedResult, lockedUser);
    }

    private void updateUserProgressAfterSubmit(User user, java.time.LocalDate today, boolean fullLengthForm, int totalScore) {
        java.time.LocalDate lastActive = user.getLastActiveDate();
        int currentStreak = user.getCurrentStreak() == null ? 0 : user.getCurrentStreak();
        int highestStreak = user.getHighestStreak() == null ? 0 : user.getHighestStreak();
        if (lastActive == null) {
            currentStreak = 1;
        } else if (lastActive.isEqual(today)) {
            currentStreak = Math.max(1, currentStreak);
        } else if (lastActive.plusDays(1).isEqual(today)) {
            currentStreak = currentStreak + 1;
        } else {
            currentStreak = 1;
        }
        highestStreak = Math.max(highestStreak, currentStreak);
        user.setCurrentStreak(currentStreak);
        user.setHighestStreak(highestStreak);
        user.setLastActiveDate(today);
        int currentBestScore = user.getTotalScore() == null ? 0 : user.getTotalScore();
        if (fullLengthForm && totalScore > currentBestScore) {
            user.setTotalScore(totalScore);
        } else if (user.getTotalScore() == null) {
            user.setTotalScore(0);
        }
        userRepository.save(user);
    }

    @Override
    @Transactional
    public ExamSessionResponse startExamSession(User currentUser, StartExamSessionRequest request) {
        User user = userRepository.findByIdWithRoleForUpdate(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Test test = testRepository.findById(request.getTestId())
                .orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
        requireTestAccess(test, user);
        requireClassroomTestAccess(test, user);
        List<Question> targets = resolveSessionQuestions(user, test, request.getAssignmentId(),
                request.getSourceResultId(), request.getPartNumbers(), request.getQuestionIds());
        boolean timed = request.getAssignmentId() != null || (request.getSourceResultId() == null
                && (request.getPartNumbers() == null || request.getPartNumbers().isEmpty()));
        String scopeKey = sessionScopeKey(test.getId(), request.getAssignmentId(), request.getSourceResultId(), targets, timed);
        LocalDateTime now = LocalDateTime.now();
        ExamSession active = examSessionRepository.findFirstByUser_IdAndScopeKeyAndStatusOrderByCreatedAtDesc(
                user.getId(), scopeKey, ExamSessionStatus.ACTIVE).orElse(null);
        boolean sessionExpired = active != null && (!active.getExpiresAt().isAfter(now)
                || !Objects.equals(active.getTestContentFingerprint(), testContentFingerprint(test))
                || (active.getDurationLimitSeconds() != null
                && !now.isBefore(active.getStartedAt().plusSeconds(active.getDurationLimitSeconds()).plusMinutes(2))));
        if (active != null && !sessionExpired && !request.isRestartActive()) {
            return toSessionResponse(active, now, true);
        }
        if (active != null) {
            active.setStatus(sessionExpired ? ExamSessionStatus.EXPIRED : ExamSessionStatus.CANCELLED);
            active.setAnswersJson("{}");
            active.setTargetQuestionIds("[]");
        }
        Assignment selectedAssignment = request.getAssignmentId() == null ? null : assignmentRepository.findByIdAndIsActiveTrue(request.getAssignmentId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        Integer duration = timed ? 7200 : null;
        LocalDateTime expiry = selectedAssignment == null ? (timed ? now.plusMinutes(122) : now.plusHours(24))
                : (selectedAssignment.getLatePolicy() == com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.LatePolicy.ACCEPT_AND_MARK_LATE
                ? selectedAssignment.getDeadline().plusHours(24) : selectedAssignment.getDeadline().plusMinutes(2));
        if (!expiry.isAfter(now.plusSeconds(2))) throw new AppException(ErrorCode.TEST_ACCESS_REQUIRED);
        ExamSession session = ExamSession.builder().user(user).test(test)
                .assignment(selectedAssignment)
                .sourceResult(request.getSourceResultId() == null ? null : testResultRepository.findByIdAndUserId(request.getSourceResultId(), user.getId())
                        .orElseThrow(() -> new AppException(ErrorCode.TEST_RESULT_NOT_FOUND)))
                .scopeKey(scopeKey).testContentFingerprint(testContentFingerprint(test)).startedAt(now).expiresAt(expiry)
                .durationLimitSeconds(duration).status(ExamSessionStatus.ACTIVE)
                .targetQuestionIds(writeJson(targets.stream().map(Question::getId).toList()))
                .answersJson("{}").lastSavedAt(now).build();
        return toSessionResponse(examSessionRepository.save(session), now, false);
    }

    @Override
    @Transactional
    public ExamSessionResponse saveExamSessionAnswers(User currentUser, String sessionId, SaveExamSessionAnswersRequest request) {
        ExamSession session = examSessionRepository.findOwnedForUpdate(sessionId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.TEST_ACCESS_REQUIRED));
        LocalDateTime now = LocalDateTime.now();
        validateActiveSession(session, currentUser, now, true);
        Map<String, Character> answers = validatedAnswerMap(request.getAnswers(), new HashSet<>(readSessionQuestionIds(session)));
        session.setAnswersJson(writeJson(answers));
        session.setLastSavedAt(now);
        return toSessionResponse(session, now, true);
    }

    @Override
    @Transactional
    public void cancelExamSession(User currentUser, String sessionId) {
        ExamSession session = examSessionRepository.findOwnedForUpdate(sessionId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.TEST_ACCESS_REQUIRED));
        if (session.getStatus() == ExamSessionStatus.ACTIVE) {
            session.setStatus(ExamSessionStatus.CANCELLED);
            session.setAnswersJson("{}");
            session.setTargetQuestionIds("[]");
            session.setLastSavedAt(LocalDateTime.now());
        }
    }

    private void validateActiveSession(ExamSession session, User user, LocalDateTime now, boolean rejectTimeUp) {
        if (!session.getUser().getId().equals(user.getId()) || session.getStatus() != ExamSessionStatus.ACTIVE
                || !session.getExpiresAt().isAfter(now)) throw new AppException(ErrorCode.TEST_ACCESS_REQUIRED);
        Test test = testRepository.findById(session.getTest().getId())
                .orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
        if (!Objects.equals(testContentFingerprint(test), session.getTestContentFingerprint())) {
            session.setStatus(ExamSessionStatus.EXPIRED);
            throw new AppException(ErrorCode.TEST_ACCESS_REQUIRED);
        }
        requireTestAccess(test, user);
        requireClassroomTestAccess(test, user);
        if (session.getAssignment() != null) {
            Assignment assignment = assignmentRepository.findByIdAndIsActiveTrue(session.getAssignment().getId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
            if (assignment.getTest() == null || !assignment.getTest().getId().equals(session.getTest().getId())
                    || assignment.getDeadline() == null) {
                throw new AppException(ErrorCode.TEST_ACCESS_REQUIRED);
            }
            validateAssignmentSessionAccess(user, assignment, test, now);
        }
        if (rejectTimeUp && session.getDurationLimitSeconds() != null
                && !now.isBefore(session.getStartedAt().plusSeconds(session.getDurationLimitSeconds()))) {
            throw new AppException(ErrorCode.TEST_ACCESS_REQUIRED);
        }
    }

    private void validateSessionForSubmit(ExamSession session, User user, LocalDateTime now) {
        if (session.getStatus() != ExamSessionStatus.ACTIVE || !session.getUser().getId().equals(user.getId())
                || !session.getExpiresAt().isAfter(now)) throw new AppException(ErrorCode.TEST_ACCESS_REQUIRED);
        Test currentTest = testRepository.findById(session.getTest().getId())
                .orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
        if (!Objects.equals(testContentFingerprint(currentTest), session.getTestContentFingerprint()))
            throw new AppException(ErrorCode.TEST_ACCESS_REQUIRED);
        requireTestAccess(currentTest, user);
        requireClassroomTestAccess(currentTest, user);
        if (session.getAssignment() != null) {
            Assignment assignment = assignmentRepository.findByIdAndIsActiveTrue(session.getAssignment().getId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
            validateAssignmentSessionAccess(user, assignment, currentTest, now);
        }
    }

    private List<Question> resolveSessionQuestions(User user, Test test, String assignmentId, String sourceResultId,
                                                   List<Integer> partNumbers, List<String> questionIds) {
        if (assignmentId != null && (sourceResultId != null || (partNumbers != null && !partNumbers.isEmpty())))
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        List<Question> all = test.getContextQuestions() == null ? List.of() : test.getContextQuestions().stream()
                .filter(Objects::nonNull).filter(c -> c.getQuestions() != null).flatMap(c -> c.getQuestions().stream())
                .sorted(Comparator.comparing(Question::getQuestionNumber, Comparator.nullsLast(Integer::compareTo))).toList();
        Set<Integer> parts = partNumbers == null ? Set.of() : new LinkedHashSet<>(partNumbers);
        if (parts.stream().anyMatch(p -> p == null || p < 1 || p > 7) || parts.size() != (partNumbers == null ? 0 : partNumbers.size()))
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        if (assignmentId != null) {
            Assignment assignment = assignmentRepository.findByIdAndIsActiveTrue(assignmentId)
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
            if (assignment.getTest() == null || !assignment.getTest().getId().equals(test.getId())) throw new AppException(ErrorCode.VALIDATION_ERROR);
            validateAssignmentSessionAccess(user, assignment, test, LocalDateTime.now());
            return all;
        }
        if (sourceResultId != null) {
            TestResult source = testResultRepository.findByIdAndUserId(sourceResultId, user.getId())
                    .filter(r -> r.getTest() != null && r.getTest().getId().equals(test.getId()))
                    .orElseThrow(() -> new AppException(ErrorCode.TEST_RESULT_NOT_FOUND));
            Set<String> wrong = userAnswerRepository.findByTestResultIdWithDetails(source.getId()).stream()
                    .filter(a -> !Boolean.TRUE.equals(a.getIsCorrect())).map(a -> a.getQuestion().getId()).collect(Collectors.toSet());
            Set<String> requested = questionIds == null || questionIds.isEmpty() ? wrong : new HashSet<>(questionIds);
            if (requested.isEmpty() || requested.size() != (questionIds == null || questionIds.isEmpty() ? wrong.size() : questionIds.size())
                    || !wrong.containsAll(requested)) throw new AppException(ErrorCode.VALIDATION_ERROR);
            List<Question> selected = all.stream().filter(q -> requested.contains(q.getId())).toList();
            if (selected.size() != requested.size()) throw new AppException(ErrorCode.VALIDATION_ERROR);
            return selected;
        }
        if (questionIds != null && !questionIds.isEmpty()) throw new AppException(ErrorCode.VALIDATION_ERROR);
        return all.stream().filter(q -> parts.isEmpty() || parts.contains(getPartNumber(q))).toList();
    }

    private void validateAssignmentSessionAccess(User student, Assignment assignment, Test test, LocalDateTime now) {
        boolean approvedMember = classMemberRepository.findForUpdateByClassroomAndStudent(
                        assignment.getClassroom().getId(), student.getId())
                .filter(member -> "APPROVED".equals(member.getStatus())).isPresent();
        if (!Boolean.TRUE.equals(assignment.getIsActive()) || assignment.getTest() == null
                || !assignment.getTest().getId().equals(test.getId()) || assignment.getDeadline() == null
                || assignment.getLatePolicy() == null || !approvedMember) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        if (!now.isBefore(assignment.getDeadline())
                && assignment.getLatePolicy() == com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.LatePolicy.REJECT_AFTER_DEADLINE) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
    }

    private Map<String, Character> validatedAnswerMap(List<SubmitExamAnswer.SingleAnswerRequest> requestAnswers, Set<String> allowed) {
        Map<String, Character> map = new HashMap<>();
        if (requestAnswers != null) for (SubmitExamAnswer.SingleAnswerRequest answer : requestAnswers) {
            if (answer == null || answer.getQuestionId() == null || !allowed.contains(answer.getQuestionId()) || map.containsKey(answer.getQuestionId()))
                throw new AppException(ErrorCode.VALIDATION_ERROR);
            Character value = answer.getSelectedAnswer() == null ? null : Character.toUpperCase(answer.getSelectedAnswer());
            if (value != null && (value < 'A' || value > 'D')) throw new AppException(ErrorCode.VALIDATION_ERROR);
            if (value != null) map.put(answer.getQuestionId(), value);
        }
        return map;
    }

    private String sessionScopeKey(String testId, String assignmentId, String sourceId, List<Question> questions, boolean timed) {
        String raw = testId + "|" + Objects.toString(assignmentId, "") + "|" + Objects.toString(sourceId, "") + "|"
                + (timed ? "TIMED" : "STOPWATCH") + "|"
                + questions.stream().map(Question::getId).sorted().collect(Collectors.joining(","));
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(raw.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception exception) { throw new IllegalStateException(exception); }
    }

    private String testContentFingerprint(Test test) {
        StringBuilder content = new StringBuilder(Objects.toString(test.getTitleTest(), ""));
        List<ContextQuestion> contexts = test.getContextQuestions() == null ? List.of() : test.getContextQuestions().stream()
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(ContextQuestion::getOrderIndex, Comparator.nullsLast(Integer::compareTo)))
                .toList();
        for (ContextQuestion context : contexts) {
            content.append('|').append(Objects.toString(context.getPart() == null ? null : context.getPart().getId(), ""))
                    .append('|').append(mediaFingerprintValue(context.getAudioPublicId(), context.getAudioUrl()))
                    .append('|').append(mediaFingerprintValue(context.getImagePublicId(), context.getImageUrl()))
                    .append('|').append(Objects.toString(context.getParagraph(), ""))
                    .append('|').append(Objects.toString(context.getTranscript(), ""));
            List<Question> questions = context.getQuestions() == null ? List.of() : context.getQuestions().stream()
                    .filter(Objects::nonNull)
                    .sorted(Comparator.comparing(Question::getQuestionNumber, Comparator.nullsLast(Integer::compareTo)))
                    .toList();
            for (Question question : questions) {
                content.append('|').append(question.getId()).append(':').append(question.getQuestionNumber())
                        .append(':').append(Objects.toString(question.getQuestionContent(), ""))
                        .append(':').append(Objects.toString(question.getOptionA(), ""))
                        .append(':').append(Objects.toString(question.getOptionB(), ""))
                        .append(':').append(Objects.toString(question.getOptionC(), ""))
                        .append(':').append(Objects.toString(question.getOptionD(), ""))
                        .append(':').append(question.getCorrectAnswer())
                        .append(':').append(Objects.toString(question.getExplanation(), ""));
            }
        }
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(content.toString().getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Không thể tạo fingerprint nội dung đề", exception);
        }
    }

    private String mediaFingerprintValue(String publicId, String url) {
        if (publicId != null && !publicId.isBlank()) return publicId;
        if (url == null || url.isBlank()) return "";
        try {
            java.net.URI uri = java.net.URI.create(url);
            return Objects.toString(uri.getScheme(), "") + "://" + Objects.toString(uri.getHost(), "")
                    + Objects.toString(uri.getPath(), "");
        } catch (IllegalArgumentException exception) {
            return url.split("[?#]", 2)[0];
        }
    }

    private int serverElapsedSeconds(ExamSession session, LocalDateTime now) {
        long elapsed = Math.max(0, java.time.Duration.between(session.getStartedAt(), now).getSeconds());
        return (int) Math.min(session.getDurationLimitSeconds() == null ? Integer.MAX_VALUE : session.getDurationLimitSeconds(), elapsed);
    }

    private List<String> readSessionQuestionIds(ExamSession session) {
        try { return objectMapper.readValue(session.getTargetQuestionIds(), new TypeReference<>() {}); }
        catch (Exception e) { throw new AppException(ErrorCode.VALIDATION_ERROR); }
    }

    private Map<String, Character> readSessionAnswers(ExamSession session) {
        try { return objectMapper.readValue(session.getAnswersJson(), new TypeReference<>() {}); }
        catch (Exception e) { throw new AppException(ErrorCode.VALIDATION_ERROR); }
    }

    private String writeJson(Object value) {
        try { return objectMapper.writeValueAsString(value); }
        catch (Exception e) { throw new AppException(ErrorCode.VALIDATION_ERROR); }
    }

    private ExamSessionResponse toSessionResponse(ExamSession session, LocalDateTime now, boolean resumed) {
        LocalDateTime timedEnd = session.getDurationLimitSeconds() == null ? null
                : session.getStartedAt().plusSeconds(session.getDurationLimitSeconds());
        if (timedEnd != null && session.getAssignment() != null
                && session.getAssignment().getLatePolicy() == com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.LatePolicy.REJECT_AFTER_DEADLINE
                && session.getAssignment().getDeadline() != null
                && session.getAssignment().getDeadline().minusSeconds(2).isBefore(timedEnd)) {
            timedEnd = session.getAssignment().getDeadline().minusSeconds(2);
        }
        LocalDateTime expiryBufferEnd = session.getExpiresAt() == null ? null : session.getExpiresAt().minusSeconds(2);
        if (timedEnd != null && expiryBufferEnd != null && expiryBufferEnd.isBefore(timedEnd)) {
            timedEnd = expiryBufferEnd;
        }
        boolean timeUp = timedEnd != null && !now.isBefore(timedEnd);
        long remaining = session.getDurationLimitSeconds() == null ? 0
                : Math.max(0, java.time.Duration.between(now, timedEnd).getSeconds());
        long elapsed = Math.max(0, java.time.Duration.between(session.getStartedAt(), now).getSeconds());
        return ExamSessionResponse.builder().sessionId(session.getId()).testId(session.getTest().getId())
                .status(session.getStatus().name()).resumed(resumed).stopwatch(session.getDurationLimitSeconds() == null)
                .timeUp(timeUp).startedAt(session.getStartedAt()).expiresAt(session.getExpiresAt()).serverNow(now)
                .remainingSeconds(remaining).elapsedSeconds(elapsed).answers(readSessionAnswers(session)).build();
    }

    private SubmitExamResponseDTO toSubmitResponse(TestResult result, User user) {
        Integer totalCount = result.getTotalCount();
        Test test = result.getTest();
        Part part = result.getPart();
        return SubmitExamResponseDTO.builder().testResultId(result.getId())
                .testId(test == null ? null : test.getId())
                .testTitle(test == null ? null : test.getTitleTest())
                .partId(part == null ? null : part.getId()).partName(part == null ? null : part.getNamePart())
                .listeningScore(result.getListeningScore()).readingScore(result.getReadingScore())
                .totalScore(result.getTotalScore()).scoreType(scoreType(result))
                .correctCount(result.getCorrectCount()).totalCount(totalCount).totalTime(result.getTotalTime())
                .createdAt(result.getCreatedAt()).currentStreak(user.getCurrentStreak())
                .highestStreak(user.getHighestStreak()).build();
    }

    private void requireTestAccess(Test test, User currentUser) {
        if (test.getClassroom() != null
                && (test.getStatus() != TestStatus.PUBLISHED || Boolean.TRUE.equals(test.getIsVip()))) {
            throw new AppException(ErrorCode.TEST_NOT_FOUND);
        }
        if (Boolean.TRUE.equals(test.getIsVip())) {
            if (currentUser == null
                    || !testEntitlementRepository.existsByUser_IdAndTest_Id(currentUser.getId(), test.getId())) {
                throw new AppException(ErrorCode.TEST_ACCESS_REQUIRED);
            }
            return; // Entitlement vĩnh viễn vẫn cho phép chủ sở hữu mở đề đã gỡ khỏi catalog.
        }
        if (test.getStatus() != TestStatus.PUBLISHED) {
            throw new AppException(ErrorCode.TEST_NOT_FOUND);
        }
    }

    @Override
    @Transactional
    public List<TestHistoryResponseDTO> getTestHistory(User currentUser, String testId) {
        List<TestResult> results = testId == null || testId.isBlank()
                ? testResultRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                : testResultRepository.findByUserIdAndTestIdOrderByCreatedAtDesc(currentUser.getId(), testId);
        return results.stream().map(result -> TestHistoryResponseDTO.builder().id(result.getId())
                .testId(result.getTest() == null ? null : result.getTest().getId())
                .testTitleId(result.getTest() == null ? "" : result.getTest().getTitleTest())
                .partId(result.getPart() == null ? null : result.getPart().getId())
                .partName(result.getPart() == null ? "Full Test / nhiều Part" : result.getPart().getNamePart())
                .typePractice(result.getPart() == null ? "Full Test / nhiều Part" : result.getPart().getNamePart())
                .listeningScore(result.getListeningScore()).readingScore(result.getReadingScore())
                .totalScore(result.getTotalScore()).scoreType(scoreType(result))
                .scoreLabel(scoreType(result).equals("ESTIMATED_SCALED") ? "Điểm ước tính" : "Số câu đúng")
                .sourceResultId(result.getSourceResult() == null ? null : result.getSourceResult().getId())
                .correctCount(result.getCorrectCount()).totalCount(result.getTotalCount())
                .totalTime(result.getTotalTime()).timeSpentFormatted(formatDuration(result.getTotalTime()))
                .createdAt(result.getCreatedAt()).build()).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TestResultDetailResponseDTO getTestResultDetail(User currentUser, String resultId) {
        TestResult result = testResultRepository.findByIdAndUserId(resultId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.TEST_RESULT_NOT_FOUND));
        return toResultDetail(result);
    }

    @Override
    @Transactional
    public TestResultDetailResponseDTO getAssignmentResultDetail(User teacher, String resultId) {
        if (teacher.getRole() == null || !"ROLE_TEACHER".equals(teacher.getRole().getRoleName())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        TestResult result = testResultRepository.findById(resultId)
                .orElseThrow(() -> new AppException(ErrorCode.TEST_RESULT_NOT_FOUND));
        Assignment assignment = result.getAssignment();
        if (assignment == null || assignment.getClassroom() == null
                || assignment.getClassroom().getTeacher() == null
                || !assignment.getClassroom().getTeacher().getId().equals(teacher.getId())) {
            throw new AppException(ErrorCode.TEST_RESULT_NOT_FOUND);
        }
        return toResultDetail(result);
    }

    private TestResultDetailResponseDTO toResultDetail(TestResult result) {
        String resultId = result.getId();
        List<TestResultDetailResponseDTO.QuestionReviewDTO> reviews = userAnswerRepository
                .findByTestResultIdWithDetails(resultId).stream().map(userAnswer -> {
                    Question question = userAnswer.getQuestion();
                    ContextQuestion context = question.getContextQuestion();
                    Part part = context.getPart();
                    return TestResultDetailResponseDTO.QuestionReviewDTO.builder()
                            .questionId(question.getId()).questionNumber(question.getQuestionNumber())
                            .partNumber(getPartNumber(question)).partName(part == null ? null : part.getNamePart())
                            .contextQuestionId(context.getId()).audioUrl(signedAudioUrl(context)).imageUrl(signedImageUrl(context))
                            .paragraph(context.getParagraph()).transcript(context.getTranscript()).translation(context.getTranslation())
                            .questionContent(question.getQuestionContent()).optionA(question.getOptionA()).optionB(question.getOptionB())
                            .optionC(question.getOptionC()).optionD(question.getOptionD()).correctAnswer(question.getCorrectAnswer())
                            .selectedAnswer(userAnswer.getSelectedAnswer()).isCorrect(userAnswer.getIsCorrect())
                            .explanation(question.getExplanation()).build();
                }).collect(Collectors.toList());
        Test test = result.getTest();
        Part part = result.getPart();
        return TestResultDetailResponseDTO.builder().testResultId(result.getId())
                .testId(test == null ? null : test.getId()).testTitle(test == null ? "" : test.getTitleTest())
                .partId(part == null ? null : part.getId()).partName(part == null ? null : part.getNamePart())
                .listeningScore(result.getListeningScore()).readingScore(result.getReadingScore())
                .totalScore(result.getTotalScore()).scoreType(scoreType(result)).correctCount(result.getCorrectCount())
                .totalCount(result.getTotalCount()).totalTime(result.getTotalTime()).createdAt(result.getCreatedAt())
                .teacherComment(result.getTeacherComment())
                .assignmentId(result.getAssignment() == null ? null : result.getAssignment().getId())
                .sourceResultId(result.getSourceResult() == null ? null : result.getSourceResult().getId())
                .lateSubmission(result.getAssignmentLate() != null ? result.getAssignmentLate()
                        : result.getAssignmentDeadlineSnapshot() != null && result.getCreatedAt() != null
                        && result.getCreatedAt().isAfter(result.getAssignmentDeadlineSnapshot()))
                .questions(reviews).build();
    }

    private int getPartNumber(Question question) {
        if (question.getContextQuestion() == null || question.getContextQuestion().getPart() == null) return 0;
        String name = question.getContextQuestion().getPart().getNamePart();
        try { return Integer.parseInt(name.replaceAll("[^0-9]", "")); }
        catch (NumberFormatException ignored) { return 0; }
    }

    private String signedAudioUrl(ContextQuestion context) {
        return "authenticated".equals(context.getAudioDeliveryType()) && context.getAudioPublicId() != null
                ? cloudinaryService.createPrivateExamMediaDownload(context.getAudioPublicId(), context.getAudioFormat(), "video").url()
                : context.getAudioUrl();
    }

    private String signedImageUrl(ContextQuestion context) {
        return "authenticated".equals(context.getImageDeliveryType()) && context.getImagePublicId() != null
                ? cloudinaryService.createPrivateExamMediaDownload(context.getImagePublicId(), context.getImageFormat(), "image").url()
                : context.getImageUrl();
    }

    private static final int[] LISTENING_SCORE_TABLE = {
            5,   15,  20,  25,  30,  35,  40,  45,  50,  55,
            60,  65,  70,  75,  80,  85,  90,  95,  100, 105,
            110, 115, 120, 125, 130, 135, 140, 145, 150, 155,
            160, 165, 170, 175, 180, 185, 190, 195, 200, 205,
            210, 215, 220, 225, 230, 235, 240, 245, 250, 255,
            260, 265, 270, 275, 280, 285, 290, 295, 300, 305,
            310, 315, 320, 325, 330, 335, 340, 345, 350, 355,
            360, 365, 370, 375, 380, 385, 395, 400, 405, 410,
            415, 420, 425, 430, 435, 440, 445, 450, 455, 460,
            465, 470, 475, 480, 485, 490, 495, 495, 495, 495,
            495
    };

    private static final int[] READING_SCORE_TABLE = {
            5,   5,   5,   10,  15,  20,  25,  30,  35,  40,
            45,  50,  55,  60,  65,  70,  75,  80,  85,  90,
            95,  100, 105, 110, 115, 120, 125, 130, 135, 140,
            145, 150, 155, 160, 165, 170, 175, 180, 185, 190,
            195, 200, 205, 210, 215, 220, 225, 230, 235, 240,
            245, 250, 255, 260, 265, 270, 275, 280, 285, 290,
            295, 300, 305, 310, 315, 320, 325, 330, 335, 340,
            345, 350, 355, 360, 365, 370, 375, 380, 385, 390,
            395, 400, 405, 410, 415, 420, 425, 430, 435, 440,
            445, 450, 455, 460, 465, 470, 475, 480, 485, 490,
            495
    };

    private int estimateListeningScore(int correct) {
        int clamped = Math.max(0, Math.min(100, correct));
        return LISTENING_SCORE_TABLE[clamped];
    }

    private int estimateReadingScore(int correct) {
        int clamped = Math.max(0, Math.min(100, correct));
        return READING_SCORE_TABLE[clamped];
    }

    private String scoreType(TestResult result) {
        if (result.getScoreType() != null && !result.getScoreType().isBlank()) return result.getScoreType();
        return result.getTotalCount() != null && result.getTotalCount() == 200
                && result.getListeningScore() != null && result.getListeningScore() >= 5 && result.getListeningScore() <= 495
                && result.getReadingScore() != null && result.getReadingScore() >= 5 && result.getReadingScore() <= 495
                ? "ESTIMATED_SCALED" : "RAW_CORRECT_COUNT";
    }

    private String formatDuration(Integer seconds) {
        int safeSeconds = seconds == null ? 0 : Math.max(0, seconds);
        int hours = safeSeconds / 3600, minutes = (safeSeconds % 3600) / 60, remainder = safeSeconds % 60;
        return hours > 0 ? String.format("%d:%02d:%02d", hours, minutes, remainder)
                : String.format("%d:%02d", minutes, remainder);
    }

    private void upsertTestDetailInPlace(Test savedTest, CreateTestRequest request) {
        if (request.getParts() == null) return;
        List<ContextQuestion> existingContexts = savedTest.getContextQuestions() == null
                ? new ArrayList<>() : new ArrayList<>(savedTest.getContextQuestions());
        Map<Integer, List<ContextQuestion>> existingByPart = new HashMap<>();
        for (ContextQuestion cq : existingContexts) {
            if (cq == null) continue;
            int pNum = contextPartNumber(cq);
            existingByPart.computeIfAbsent(pNum, ignored -> new ArrayList<>()).add(cq);
        }
        for (List<ContextQuestion> list : existingByPart.values()) {
            list.sort(Comparator.comparing(ContextQuestion::getOrderIndex,
                    Comparator.nullsLast(Comparator.naturalOrder())));
        }

        Set<String> retainedContextIds = new HashSet<>();
        int globalQuestionCounter = 1;
        for (TestPartRequest partRequest : request.getParts()) {
            if (partRequest == null) continue;
            String partName = "Part " + partRequest.getPartNumber();
            Part part = partRepository.findByNamePart(partName)
                    .orElseThrow(() -> new AppException(ErrorCode.PART_NOT_FOUND));
            List<ContextQuestion> partExisting = existingByPart.getOrDefault(partRequest.getPartNumber(), List.of());
            int questionCounter = getStartingQuestionNumber(partRequest.getPartNumber(), globalQuestionCounter);
            if (partRequest.getContextQuestions() != null) {
                int cqIdx = 0;
                for (ContextQuestionRequest contextQuestionRequest : partRequest.getContextQuestions()) {
                    if (contextQuestionRequest == null) continue;
                    int startQuestionNumberOfContext = questionCounter;
                    int finalOrderIndex = (contextQuestionRequest.getOrderIndex() != null && contextQuestionRequest.getOrderIndex() > 0)
                            ? contextQuestionRequest.getOrderIndex() : startQuestionNumberOfContext;
                    String resolvedAudioUrl = isPrivateAsset(contextQuestionRequest.getAudioPublicId(),
                            contextQuestionRequest.getAudioFormat(), contextQuestionRequest.getAudioDeliveryType())
                            ? null : contextQuestionRequest.getAudioUrl();
                    String resolvedImageUrl = isPrivateAsset(contextQuestionRequest.getImagePublicId(),
                            contextQuestionRequest.getImageFormat(), contextQuestionRequest.getImageDeliveryType())
                            ? null : contextQuestionRequest.getImageUrl();

                    ContextQuestion targetCq = cqIdx < partExisting.size() ? partExisting.get(cqIdx) : null;
                    if (targetCq == null) {
                        targetCq = ContextQuestion.builder()
                                .audioUrl(resolvedAudioUrl)
                                .imageUrl(resolvedImageUrl)
                                .audioPublicId(contextQuestionRequest.getAudioPublicId())
                                .imagePublicId(contextQuestionRequest.getImagePublicId())
                                .audioFormat(contextQuestionRequest.getAudioFormat())
                                .imageFormat(contextQuestionRequest.getImageFormat())
                                .audioDeliveryType(contextQuestionRequest.getAudioDeliveryType())
                                .imageDeliveryType(contextQuestionRequest.getImageDeliveryType())
                                .paragraph(contextQuestionRequest.getParagraph())
                                .transcript(contextQuestionRequest.getTranscript())
                                .translation(contextQuestionRequest.getTranslation())
                                .test(savedTest)
                                .part(part)
                                .orderIndex(finalOrderIndex)
                                .questions(new ArrayList<>())
                                .build();
                        targetCq = contextQuestionRepository.save(targetCq);
                        if (savedTest.getContextQuestions() != null) {
                            savedTest.getContextQuestions().add(targetCq);
                        }
                    } else {
                        targetCq.setAudioUrl(resolvedAudioUrl);
                        targetCq.setImageUrl(resolvedImageUrl);
                        targetCq.setAudioPublicId(contextQuestionRequest.getAudioPublicId());
                        targetCq.setImagePublicId(contextQuestionRequest.getImagePublicId());
                        targetCq.setAudioFormat(contextQuestionRequest.getAudioFormat());
                        targetCq.setImageFormat(contextQuestionRequest.getImageFormat());
                        targetCq.setAudioDeliveryType(contextQuestionRequest.getAudioDeliveryType());
                        targetCq.setImageDeliveryType(contextQuestionRequest.getImageDeliveryType());
                        targetCq.setParagraph(contextQuestionRequest.getParagraph());
                        targetCq.setTranscript(contextQuestionRequest.getTranscript());
                        targetCq.setTranslation(contextQuestionRequest.getTranslation());
                        targetCq.setPart(part);
                        targetCq.setOrderIndex(finalOrderIndex);
                        targetCq = contextQuestionRepository.save(targetCq);
                    }
                    retainedContextIds.add(targetCq.getId());

                    List<Question> existingQuestions = targetCq.getQuestions() == null
                            ? new ArrayList<>() : new ArrayList<>(targetCq.getQuestions());
                    existingQuestions.sort(Comparator.comparing(Question::getQuestionNumber,
                            Comparator.nullsLast(Comparator.naturalOrder())));
                    Set<String> retainedQuestionIds = new HashSet<>();

                    if (contextQuestionRequest.getQuestions() != null) {
                        int qIdx = 0;
                        for (QuestionRequest questionRequest : contextQuestionRequest.getQuestions()) {
                            if (questionRequest == null) continue;
                            char correctAns = 'A';
                            int questionNumber = (questionRequest.getQuestionNumber() != null && questionRequest.getQuestionNumber() > 0)
                                    ? questionRequest.getQuestionNumber() : questionCounter;
                            if (questionRequest.getCorrectAnswer() != null && !questionRequest.getCorrectAnswer().isEmpty()) {
                                correctAns = questionRequest.getCorrectAnswer().toUpperCase().charAt(0);
                            }
                            Question targetQ = qIdx < existingQuestions.size() ? existingQuestions.get(qIdx) : null;
                            if (targetQ == null) {
                                targetQ = Question.builder()
                                        .questionContent(questionRequest.getQuestionContent())
                                        .optionA(questionRequest.getOptionA())
                                        .optionB(questionRequest.getOptionB())
                                        .optionC(questionRequest.getOptionC())
                                        .optionD(questionRequest.getOptionD())
                                        .correctAnswer(correctAns)
                                        .explanation(questionRequest.getExplanation())
                                        .contextQuestion(targetCq)
                                        .questionNumber(questionNumber)
                                        .build();
                                targetQ = questionRepository.save(targetQ);
                                if (targetCq.getQuestions() != null) {
                                    targetCq.getQuestions().add(targetQ);
                                }
                            } else {
                                targetQ.setQuestionContent(questionRequest.getQuestionContent());
                                targetQ.setOptionA(questionRequest.getOptionA());
                                targetQ.setOptionB(questionRequest.getOptionB());
                                targetQ.setOptionC(questionRequest.getOptionC());
                                targetQ.setOptionD(questionRequest.getOptionD());
                                targetQ.setCorrectAnswer(correctAns);
                                targetQ.setExplanation(questionRequest.getExplanation());
                                targetQ.setQuestionNumber(questionNumber);
                                targetQ = questionRepository.save(targetQ);
                            }
                            retainedQuestionIds.add(targetQ.getId());
                            questionCounter++;
                            globalQuestionCounter++;
                            qIdx++;
                        }
                    }

                    if (targetCq.getQuestions() != null) {
                        Iterator<Question> qIter = targetCq.getQuestions().iterator();
                        while (qIter.hasNext()) {
                            Question oldQ = qIter.next();
                            if (oldQ != null && oldQ.getId() != null && !retainedQuestionIds.contains(oldQ.getId())
                                    && !userAnswerRepository.existsByQuestion_Id(oldQ.getId())) {
                                qIter.remove();
                                questionRepository.delete(oldQ);
                            }
                        }
                    }
                    cqIdx++;
                }
            }
        }

        if (savedTest.getContextQuestions() != null) {
            Iterator<ContextQuestion> cqIter = savedTest.getContextQuestions().iterator();
            while (cqIter.hasNext()) {
                ContextQuestion oldCq = cqIter.next();
                if (oldCq != null && oldCq.getId() != null && !retainedContextIds.contains(oldCq.getId())
                        && !contextReferencedByTestResult(oldCq.getId())) {
                    cqIter.remove();
                    contextQuestionRepository.delete(oldCq);
                }
            }
        }
    }

    public void saveTestDetail(Test savedTest, CreateTestRequest request)
    {
        int globalQuestionCounter = 1;
        if(request.getParts()!=null){
            for(TestPartRequest partRequest: request.getParts())
            {
                String partName = "Part " + partRequest.getPartNumber();
                Part part = partRepository.findByNamePart(partName)
                        .orElseThrow(() -> new AppException(ErrorCode.PART_NOT_FOUND));


                int questionCounter = getStartingQuestionNumber(partRequest.getPartNumber(), globalQuestionCounter);
                if(partRequest.getContextQuestions()!=null)
                {
                    for(ContextQuestionRequest contextQuestionRequest: partRequest.getContextQuestions())
                    {
                        int startQuestionNumberOfContext = questionCounter;
                        int finalOrderIndex = (contextQuestionRequest.getOrderIndex()!=null && contextQuestionRequest.getOrderIndex() > 0) ? contextQuestionRequest.getOrderIndex(): startQuestionNumberOfContext;
                        ContextQuestion contextQuestion = ContextQuestion.builder()
                                .audioUrl(isPrivateAsset(contextQuestionRequest.getAudioPublicId(),
                                        contextQuestionRequest.getAudioFormat(), contextQuestionRequest.getAudioDeliveryType())
                                        ? null : contextQuestionRequest.getAudioUrl())
                                .imageUrl(isPrivateAsset(contextQuestionRequest.getImagePublicId(),
                                        contextQuestionRequest.getImageFormat(), contextQuestionRequest.getImageDeliveryType())
                                        ? null : contextQuestionRequest.getImageUrl())
                                .audioPublicId(contextQuestionRequest.getAudioPublicId())
                                .imagePublicId(contextQuestionRequest.getImagePublicId())
                                .audioFormat(contextQuestionRequest.getAudioFormat())
                                .imageFormat(contextQuestionRequest.getImageFormat())
                                .audioDeliveryType(contextQuestionRequest.getAudioDeliveryType())
                                .imageDeliveryType(contextQuestionRequest.getImageDeliveryType())
                                .paragraph(contextQuestionRequest.getParagraph())
                                .transcript(contextQuestionRequest.getTranscript())
                                .translation(contextQuestionRequest.getTranslation())
                                .test(savedTest)
                                .part(part)
                                .orderIndex(finalOrderIndex)
                                .build();
                        ContextQuestion savedContextQuestion = contextQuestionRepository.save(contextQuestion);
                        if (contextQuestionRequest.getQuestions() != null) for(QuestionRequest questionRequest: contextQuestionRequest.getQuestions())
                        {
                            char correctAns = 'A';
                            int questionNumber = (questionRequest.getQuestionNumber()!=null && questionRequest.getQuestionNumber() >0) ?
                                    questionRequest.getQuestionNumber(): questionCounter;
                            if(questionRequest.getCorrectAnswer()!=null && !questionRequest.getCorrectAnswer().isEmpty())
                            {
                                correctAns = questionRequest.getCorrectAnswer().toUpperCase().charAt(0);
                            }
                            Question question = Question.builder()
                                    .questionContent(questionRequest.getQuestionContent())
                                    .optionA(questionRequest.getOptionA())
                                    .optionB(questionRequest.getOptionB())
                                    .optionC(questionRequest.getOptionC())
                                    .optionD(questionRequest.getOptionD())
                                    .correctAnswer(correctAns)
                                    .explanation(questionRequest.getExplanation())
                                    .contextQuestion(savedContextQuestion)
                                    .questionNumber(questionNumber)
                                    .build();
                            questionRepository.save(question);
                            questionCounter++;
                            globalQuestionCounter++;
                        }
                    }
                }
            }
        }
    }


    private int getStartingQuestionNumber(int part, int globalQuestionCounter){
        switch (part){
            case 1: return 1;
            case 2: return 7;
            case 3: return 32;
            case 4: return 71;
            case 5: return 101;
            case 6: return 131;
            case 7: return 147;
            default: return globalQuestionCounter;
        }
    }

    private int getEndingQuestionNumber(int part) {
        return switch (part) {
            case 1 -> 6;
            case 2 -> 31;
            case 3 -> 70;
            case 4 -> 100;
            case 5 -> 130;
            case 6 -> 146;
            case 7 -> 200;
            default -> 0;
        };
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponseDTO> getCommentsByTestId(String testId) {
        if (!testRepository.existsById(testId)) {
            throw new AppException(ErrorCode.TEST_NOT_FOUND);
        }
        List<TestComment> comments = testCommentRepository.findByTestIdWithUser(testId);
        return comments.stream().map(this::mapToCommentResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CommentResponseDTO addComment(String testId, CreateCommentRequest request, User currentUser) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        User managedUser = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (Boolean.TRUE.equals(managedUser.getIsLocked())) {
            throw new AppException(ErrorCode.USER_ACCOUNT_LOCKED);
        }
        Test managedTest = testRepository.findById(testId)
                .orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));

        String content = request.getContent() != null ? request.getContent().trim() : "";
        if (content.isEmpty()) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        TestComment comment = TestComment.builder()
                .test(managedTest)
                .user(managedUser)
                .content(content)
                .build();
        TestComment saved = testCommentRepository.save(comment);
        return mapToCommentResponse(saved);
    }

    @Override
    @Transactional
    public CommentResponseDTO updateComment(String commentId, CreateCommentRequest request, User currentUser) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        User managedUser = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (Boolean.TRUE.equals(managedUser.getIsLocked())) {
            throw new AppException(ErrorCode.USER_ACCOUNT_LOCKED);
        }

        TestComment comment = testCommentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        boolean isAuthor = comment.getUser() != null && comment.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() != null && "ROLE_ADMIN".equalsIgnoreCase(currentUser.getRole().getRoleName());

        if (!isAuthor && !isAdmin) {
            throw new AppException(ErrorCode.COMMENT_ACTION_FORBIDDEN);
        }

        String content = request.getContent() != null ? request.getContent().trim() : "";
        if (content.isEmpty()) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        comment.setContent(content);
        TestComment updated = testCommentRepository.save(comment);
        return mapToCommentResponse(updated);
    }

    @Override
    @Transactional
    public void deleteComment(String commentId, User currentUser) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        TestComment comment = testCommentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        boolean isAuthor = comment.getUser() != null && comment.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() != null && "ROLE_ADMIN".equalsIgnoreCase(currentUser.getRole().getRoleName());

        if (!isAuthor && !isAdmin) {
            throw new AppException(ErrorCode.COMMENT_ACTION_FORBIDDEN);
        }

        User commentOwner = comment.getUser();
        Test commentTest = comment.getTest();
        testCommentRepository.delete(comment);

        if (!isAuthor && isAdmin && commentOwner != null && commentTest != null) {
            notificationService.createNotification(
                    commentOwner,
                    "Thông báo kiểm duyệt thảo luận đề thi",
                    "Một bình luận của bạn tại đề \"" + commentTest.getTitleTest()
                            + "\" đã được quản trị viên gỡ bỏ theo quy định thảo luận của hệ thống.",
                    "COMMENT_MODERATED",
                    "/courses/" + commentTest.getId()
            );
        }
    }

    private CommentResponseDTO mapToCommentResponse(TestComment comment) {
        User u = comment.getUser();
        String roleName = (u != null && u.getRole() != null) ? u.getRole().getRoleName() : "ROLE_USER";
        boolean isOfficial = "ROLE_ADMIN".equalsIgnoreCase(roleName) || "ROLE_TEACHER".equalsIgnoreCase(roleName);
        String displayRole = "USER";
        if ("ROLE_ADMIN".equalsIgnoreCase(roleName)) displayRole = "ADMIN";
        else if ("ROLE_TEACHER".equalsIgnoreCase(roleName)) displayRole = "TEACHER";

        return CommentResponseDTO.builder()
                .id(comment.getId())
                .testId(comment.getTest() != null ? comment.getTest().getId() : null)
                .userId(u != null ? u.getId() : null)
                .userName(u != null ? (u.getUserName() != null ? u.getUserName() : u.getUserEmail()) : "Người dùng")
                .userAvatar(u != null ? u.getUserAvatar() : null)
                .roleName(displayRole)
                .isOfficial(isOfficial)
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
