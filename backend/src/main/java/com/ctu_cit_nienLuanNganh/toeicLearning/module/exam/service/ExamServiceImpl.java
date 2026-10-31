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
import java.time.LocalDateTime;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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

    private final CloudinaryService cloudinaryService;
    private final AuditEventService auditEventService;

    private final PartForUserMapper partForUserMapper;


    public PageResponse<Test> getFullTest(PageParams pageParams, TestStatus status, TestCatalogCategory category){
        // Mặc định nếu không truyền status thì chỉ lấy các đề thi đã PUBLISHED, học viên không truy cập các bản nháp được
        if(status == null) {
            status = TestStatus.PUBLISHED;
        }

        if (category == null) category = TestCatalogCategory.ALL;
        String categoryName = category.name();
        String keyword = pageParams.getKeyWord() == null ? "" : pageParams.getKeyWord().trim();
        Page<Test> listTest = testRepository.findCatalogTests(status, categoryName, keyword, pageParams.toPageable());
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
        validatePrivateAssets(teacher, request, null);
        TestStatus status = request.getStatus() == null ? TestStatus.DRAFT : request.getStatus();
        if (Boolean.TRUE.equals(request.getIsVip()) || request.getVipPriceVnd() != null || request.getClassroomId() != null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        if (status == TestStatus.PUBLISHED) validatePublishableTest(request);
        Test test = Test.builder().titleTest(request.getTitleTest()).status(status).isVip(false)
                .classroom(classroom).ownerTeacher(teacher).build();
        Test savedTest = testRepository.save(test);
        saveTestDetail(savedTest, request);
        auditEventService.record(teacher, "CLASS_TEST_CREATED", "TEST", savedTest.getId(), "status=" + status);
    }

    @Transactional
    public void updateClassroomTest(User teacher, String classroomId, String testId, CreateTestRequest request) {
        Test test = requireOwnedClassroomTest(teacher, classroomId, testId);
        validatePrivateAssets(teacher, request, test);
        if (testResultRepository.existsByTestId(testId) || assignmentRepository.existsByTest_Id(testId)
                || paymentTransactionRepository.existsByTest_Id(testId)) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION);
        }
        if (Boolean.TRUE.equals(request.getIsVip()) || request.getVipPriceVnd() != null
                || request.getClassroomId() != null) throw new AppException(ErrorCode.VALIDATION_ERROR);
        TestStatus previousStatus = test.getStatus();
        TestStatus targetStatus = request.getStatus() == null ? previousStatus : request.getStatus();
        if (targetStatus == TestStatus.PUBLISHED) {
            validatePrivateAssets(teacher, request, null);
            validatePublishableTest(request);
        }
        test.setTitleTest(request.getTitleTest());
        test.setStatus(targetStatus);
        deleteUnuseMedia(test, request);
        if (test.getContextQuestions() != null) {
            test.getContextQuestions().clear();
            testRepository.flush();
        }
        saveTestDetail(test, request);
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
                || paymentTransactionRepository.existsByTest_Id(testId)) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION);
        }
        deleteUnuseMedia(test, new CreateTestRequest());
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
        validatePrivateAssets(admin, request, null);
        TestStatus status = request.getStatus() != null ? request.getStatus() : TestStatus.DRAFT;
        validateVipPricing(request);
        if (status == TestStatus.PUBLISHED) validatePublishableTest(request);
        Test test = Test.builder()
                .titleTest(request.getTitleTest())
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
        Test test = testRepository.findById(testID).orElseThrow(()-> new AppException(ErrorCode.TEST_NOT_FOUND));
        validatePrivateAssets(admin, request, test);
        if (testResultRepository.existsByTestId(testID)) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION);
        }
        TestStatus previousStatus = test.getStatus();
        TestStatus targetStatus = request.getStatus() != null ? request.getStatus() : previousStatus;
        validateVipPricing(request);
        if (targetStatus == TestStatus.PUBLISHED) {
            validatePrivateAssets(admin, request, null);
            validatePublishableTest(request);
        }
        test.setTitleTest(request.getTitleTest());
        test.setIsVip(Boolean.TRUE.equals(request.getIsVip()));
        test.setVipPriceVnd(Boolean.TRUE.equals(request.getIsVip()) ? request.getVipPriceVnd() : null);
        if(request.getStatus() != null) {
            test.setStatus(request.getStatus());
        }
        testRepository.save(test);
        deleteUnuseMedia(test, request);
        if(test.getContextQuestions()!=null) {
            test.getContextQuestions().clear();
            testRepository.flush();
        }
        saveTestDetail(test, request);
        auditEventService.record(admin, "SYSTEM_TEST_UPDATED", "TEST", test.getId(),
                "status=" + previousStatus + "->" + targetStatus);
    }

    private void validateVipPricing(CreateTestRequest request) {
        if (Boolean.TRUE.equals(request.getIsVip())) {
            BigDecimal price = request.getVipPriceVnd();
            if (price == null || price.scale() > 0 || price.compareTo(BigDecimal.ONE) < 0
                    || price.compareTo(new BigDecimal("99999999")) > 0) {
                throw new AppException(ErrorCode.VALIDATION_ERROR);
            }
        } else if (request.getVipPriceVnd() != null) {
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
                if (context.getOrderIndex() != null && context.getOrderIndex() > 0
                        && context.getOrderIndex() != expectedQuestionNumber) {
                    throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
                }
                validatePart7Grouping(expectedQuestionNumber, context.getQuestions().size(), context.getParagraph());
                String audioUrl = isPrivateAsset(context.getAudioPublicId(), context.getAudioFormat(), context.getAudioDeliveryType())
                        ? "authenticated" : context.getAudioUrl();
                String imageUrl = isPrivateAsset(context.getImagePublicId(), context.getImageFormat(), context.getImageDeliveryType())
                        ? "authenticated" : context.getImageUrl();
                validatePublishableContext(partNumber, audioUrl, imageUrl,
                        context.getParagraph(), context.getQuestions().size());
                if (Boolean.TRUE.equals(request.getIsVip())) validatePrivateMedia(context);
                for (QuestionRequest question : context.getQuestions()) {
                    if (question == null) throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
                    if (expectedQuestionNumber > endingQuestionNumber) {
                        throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
                    }
                    int suppliedQuestionNumber = question.getQuestionNumber() == null || question.getQuestionNumber() <= 0
                            ? expectedQuestionNumber : question.getQuestionNumber();
                    if (suppliedQuestionNumber != expectedQuestionNumber
                            || !questionNumbers.add(suppliedQuestionNumber)) {
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
            int partNumber = parsePartNumber(context.getPart() == null ? null : context.getPart().getNamePart());
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
                if (context.getOrderIndex() != null && context.getOrderIndex() > 0
                        && context.getOrderIndex() != expectedQuestionNumber) {
                    throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
                }
                validatePart7Grouping(expectedQuestionNumber, questions.size(), context.getParagraph());
                String audioUrl = isPrivateAsset(context.getAudioPublicId(), context.getAudioFormat(), context.getAudioDeliveryType())
                        ? "authenticated" : context.getAudioUrl();
                String imageUrl = isPrivateAsset(context.getImagePublicId(), context.getImageFormat(), context.getImageDeliveryType())
                        ? "authenticated" : context.getImageUrl();
                validatePublishableContext(partNumber, audioUrl, imageUrl,
                        context.getParagraph(), questions.size());
                if (Boolean.TRUE.equals(test.getIsVip()) && !hasPrivateMedia(context)) {
                    throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
                }
                List<Question> orderedQuestions = new ArrayList<>(questions);
                orderedQuestions.sort(Comparator.comparing(question -> question == null ? null : question.getQuestionNumber(),
                        Comparator.nullsLast(Comparator.naturalOrder())));
                for (Question question : orderedQuestions) {
                    if (expectedQuestionNumber > endingQuestionNumber
                            || question == null || question.getQuestionNumber() == null
                            || question.getQuestionNumber() != expectedQuestionNumber
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
        int expectedQuestionCount = switch (startQuestionNumber) {
            case 147, 149, 151, 156 -> 2;
            case 153, 158, 161 -> 3;
            case 164, 168, 172 -> 4;
            case 176, 181, 186, 191, 196 -> 5;
            default -> throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
        };
        if (questionCount != expectedQuestionCount || isBlank(paragraph)) {
            throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
        }

        int expectedPassageCount = switch (startQuestionNumber) {
            case 176, 181 -> 2;
            case 186, 191, 196 -> 3;
            default -> 1;
        };
        Pattern separator = Pattern.compile("(?im)^[ \\t]*---[ \\t]*(?:BÀI ĐỌC|VĂN BẢN|PASSAGE)[ \\t]*([0-9]+)[ \\t]*---[ \\t]*$");
        Matcher matcher = separator.matcher(paragraph);
        int passageCount = 1;
        int expectedMarker = 2;
        int contentStart = 0;
        while (matcher.find()) {
            if (!matcher.group(1).equals(Integer.toString(expectedMarker))
                    || paragraph.substring(contentStart, matcher.start()).isBlank()) {
                throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
            }
            passageCount++;
            expectedMarker++;
            contentStart = matcher.end();
        }
        if (paragraph.substring(contentStart).isBlank() || passageCount != expectedPassageCount) {
            throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
        }
    }

    private void validatePrivateMedia(ContextQuestionRequest context) {
        boolean audioValid = isBlank(context.getAudioUrl()) ||
                (isPrivateAsset(context.getAudioPublicId(), context.getAudioFormat(), context.getAudioDeliveryType()));
        boolean imageValid = isBlank(context.getImageUrl()) ||
                (isPrivateAsset(context.getImagePublicId(), context.getImageFormat(), context.getImageDeliveryType()));
        if (!audioValid || !imageValid) throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
    }

    private boolean hasPrivateMedia(ContextQuestion context) {
        boolean audioValid = isBlank(context.getAudioUrl()) || isPrivateAsset(
                context.getAudioPublicId(), context.getAudioFormat(), context.getAudioDeliveryType());
        boolean imageValid = isBlank(context.getImageUrl()) || isPrivateAsset(
                context.getImagePublicId(), context.getImageFormat(), context.getImageDeliveryType());
        return audioValid && imageValid;
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
                    context.getAudioDeliveryType(), "video", null);
            validatePrivateAsset(actor, context.getImagePublicId(), context.getImageFormat(),
                    context.getImageDeliveryType(), "image", null);
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
        if (partNumber >= 1 && partNumber <= 4 && isBlank(audioUrl)) {
            throw new AppException(ErrorCode.TEST_CONTENT_INVALID);
        }
        if (partNumber == 1 && isBlank(imageUrl)) {
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
        if (partNumber >= 3 && (isBlank(content) || isBlank(optionA) || isBlank(optionB)
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
        TestStatus previousStatus = test.getStatus();
        test.setStatus(TestStatus.DRAFT);
        testRepository.save(test);
        auditEventService.record(admin, "SYSTEM_TEST_DRAFTED", "TEST", test.getId(),
                "status=" + previousStatus + "->" + TestStatus.DRAFT);
    }

    @Transactional
    public boolean deleteFullTest(User admin, String testID){
        Test test = testRepository.findById(testID).orElseThrow(()-> new AppException(ErrorCode.TEST_NOT_FOUND));
        TestStatus previousStatus = test.getStatus();
        boolean hasReferences = testResultRepository.existsByTestId(testID)
                || paymentTransactionRepository.existsByTest_Id(testID)
                || assignmentRepository.existsByTest_Id(testID);
        if (hasReferences) {
            test.setStatus(TestStatus.DRAFT);
            testRepository.save(test);
            auditEventService.record(admin, "SYSTEM_TEST_ARCHIVED", "TEST", test.getId(),
                    "status=" + previousStatus + "->DRAFT; reason=referenced");
            return true;
        }
        deleteTestMediaIfUnreferenced(test);
        auditEventService.record(admin, "SYSTEM_TEST_DELETED", "TEST", test.getId(), "status=" + previousStatus);
        testRepository.delete(test);
        return false;
    }

    private void deleteTestMediaIfUnreferenced(Test test) {
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
        int listeningScore = fullLengthForm ? estimateSectionScore(listeningCorrect, listeningTotal) : listeningCorrect;
        int readingScore = fullLengthForm ? estimateSectionScore(readingCorrect, readingTotal) : readingCorrect;
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

        return toSubmitResponse(savedResult, lockedUser);
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

    private int estimateSectionScore(int correct, int total) {
        if (total <= 0) return 5;
        return Math.max(5, Math.min(495, Math.round((5f + 490f * correct / total) / 5f) * 5));
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
}
