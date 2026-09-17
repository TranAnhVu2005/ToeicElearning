package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageParams;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.TestStatus;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.service.CloudinaryService;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.ContextQuestion;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Part;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Question;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Test;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.PartForUserResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.mapper.PartForUserMapper;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request.*;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.ContextQuestionRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.PartRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.QuestionRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.TestRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ExamService {
    private final TestRepository testRepository;
    private final PartRepository partRepository;
    private final ContextQuestionRepository contextQuestionRepository;
    private final QuestionRepository questionRepository;

    private final CloudinaryService cloudinaryService;

    private final PartForUserMapper partForUserMapper;


    public PageResponse<Test> getFullTest(PageParams pageParams, TestStatus status){
        // Mặc định nếu không truyền status thì chỉ lấy các đề thi đã PUBLISHED, học viên không truy cập các bản nháp được
        if(status == null) {
            status = TestStatus.PUBLISHED;
        }

        Page<Test> listTest;
        boolean hasKeyword = pageParams.getKeyWord() != null && !pageParams.getKeyWord().isBlank();
        if(hasKeyword) {
            listTest = testRepository.findByTitleTestContainingIgnoreCaseAndStatus(
                    pageParams.getKeyWord().trim(), status, pageParams.toPageable());
        } else {
            listTest = testRepository.findByStatus(status, pageParams.toPageable());
        }
        return PageResponse.of(listTest);
    }

    public Test getTestDetail(String testID){
        return testRepository.findById(testID).orElseThrow(()-> new AppException(ErrorCode.TEST_NOT_FOUND));
    }

    public PartForUserResponseDTO getPart(String testId, String partId){
        Test selectedTest = testRepository.findById(testId)
                .orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
        Part selectedPart = partRepository.findById(partId)
                .orElseThrow(() -> new AppException(ErrorCode.PART_NOT_FOUND));
        List<ContextQuestion> contextQuestionList = contextQuestionRepository.findByTestIdAndPartIdOrderByOrderIndexAsc(testId, partId);
        return partForUserMapper.toDTO(selectedTest, selectedPart, contextQuestionList );
    }



    @Transactional
    public void createFullTest(CreateTestRequest request){
        Test test = Test.builder()
                .titleTest(request.getTitleTest())
                .status(request.getStatus() != null ? request.getStatus() : TestStatus.DRAFT)
                .build();
        Test savedTest = testRepository.save(test);
        saveTestDetail(savedTest, request);
    }

    @Transactional
    public void updateFullTest(String testID,CreateTestRequest request)
    {
        Test test = testRepository.findById(testID).orElseThrow(()-> new AppException(ErrorCode.TEST_NOT_FOUND));
        test.setTitleTest(request.getTitleTest());
        if(request.getStatus() != null) {
            test.setStatus(request.getStatus());
        }
        testRepository.save(test);
        if(test.getContextQuestions()!=null)
        {
            deleteUnuseMedia(test, request);
            test.getContextQuestions().clear();
            testRepository.flush();
        }
        saveTestDetail(test, request);
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
                // Nếu có link audio cũ mà không còn trong danh sách mới -> Xóa trên Cloudinary
                if (oldCq.getAudioUrl() != null && !oldCq.getAudioUrl().isBlank() && !newUrls.contains(oldCq.getAudioUrl().trim())) {
                    cloudinaryService.deleteFileByUrl(oldCq.getAudioUrl());
                }
                // Nếu có link ảnh cũ mà không còn trong danh sách mới -> Xóa trên Cloudinary
                if (oldCq.getImageUrl() != null && !oldCq.getImageUrl().isBlank() && !newUrls.contains(oldCq.getImageUrl().trim())) {
                    cloudinaryService.deleteFileByUrl(oldCq.getImageUrl());
                }
            }
        }
    }

    @Transactional
    public void publishTest(String testID) {
        Test test = testRepository.findById(testID).orElseThrow(()-> new AppException(ErrorCode.TEST_NOT_FOUND));
        test.setStatus(TestStatus.PUBLISHED);
        testRepository.save(test);
    }

    @Transactional
    public void draftTest(String testID) {
        Test test = testRepository.findById(testID).orElseThrow(()-> new AppException(ErrorCode.TEST_NOT_FOUND));
        test.setStatus(TestStatus.DRAFT);
        testRepository.save(test);
    }

    @Transactional
    public void deleteFullTest(String testID){
        Test test = testRepository.findById(testID).orElseThrow(()-> new AppException(ErrorCode.TEST_NOT_FOUND));
        if(test.getContextQuestions()!=null){
            for(ContextQuestion contextQuestion : test.getContextQuestions()){
                if(contextQuestion.getAudioUrl()!=null && !contextQuestion.getAudioUrl().isBlank()){
                    cloudinaryService.deleteFileByUrl(contextQuestion.getAudioUrl());
                }
                if(contextQuestion.getImageUrl()!=null && !contextQuestion.getImageUrl().isBlank()){
                    cloudinaryService.deleteFileByUrl(contextQuestion.getImageUrl());
                }
            }
        }
        testRepository.delete(test);
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
                                .audioUrl(contextQuestionRequest.getAudioUrl())
                                .imageUrl(contextQuestionRequest.getImageUrl())
                                .paragraph(contextQuestionRequest.getParagraph())
                                .transcript(contextQuestionRequest.getTranscript())
                                .translation(contextQuestionRequest.getTranslation())
                                .test(savedTest)
                                .part(part)
                                .orderIndex(finalOrderIndex)
                                .build();
                        ContextQuestion savedContextQuestion = contextQuestionRepository.save(contextQuestion);
                        for(QuestionRequest questionRequest: contextQuestionRequest.getQuestions())
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
}
