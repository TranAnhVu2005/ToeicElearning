package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageParams;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.ContextQuestion;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Part;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Question;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Test;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request.ContextQuestionRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request.CreateTestRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request.QuestionRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request.TestPartRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.ContextQuestionRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.PartRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.QuestionRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.TestRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamService {
    private final TestRepository testRepository;
    private final PartRepository partRepository;
    private final ContextQuestionRepository contextQuestionRepository;
    private final QuestionRepository questionRepository;

    public PageResponse<Test> getFullTest(PageParams pageParams){
        Page<Test> listTest = testRepository.findAll(pageParams.toPageable());
        return PageResponse.of(listTest);
    }

    public Test getTestDetail(String testID){
        return testRepository.findById(testID).orElseThrow(()-> new AppException(ErrorCode.TEST_NOT_FOUND));
    }

    @Transactional
    public void createFullTest(CreateTestRequest request){
        Test test = Test.builder()
                .titleTest(request.getTitleTest())
                .build();
        Test savedTest = testRepository.save(test);
        saveTestDetail(savedTest, request);
    }

    @Transactional
    public void updateFullTest(String testID,CreateTestRequest request)
    {
        Test test = testRepository.findById(testID).orElseThrow(()-> new AppException(ErrorCode.TEST_NOT_FOUND));
        test.setTitleTest(request.getTitleTest());
        testRepository.save(test);
        if(test.getContextQuestions()!=null)
        {
            test.getContextQuestions().clear();
            testRepository.flush();
        }
        saveTestDetail(test, request);

    }

    @Transactional
    public void deleteFullTest(String testID){
        Test test = testRepository.findById(testID).orElseThrow(()-> new AppException(ErrorCode.TEST_NOT_FOUND));
        testRepository.delete(test);
    }

    public void saveTestDetail(Test savedTest, CreateTestRequest request)
    {
        if(request.getParts()!=null){
            for(TestPartRequest partRequest: request.getParts())
            {
                String partName = "Part " + partRequest.getPartNumber();
                Part part = partRepository.findByNamePart(partName)
                        .orElseThrow(() -> new AppException(ErrorCode.PART_NOT_FOUND));
                if(partRequest.getContextQuestions()!=null)
                {
                    for(ContextQuestionRequest contextQuestionRequest: partRequest.getContextQuestions())
                    {
                        ContextQuestion contextQuestion = ContextQuestion.builder()
                                .audioUrl(contextQuestionRequest.getAudioUrl())
                                .imageUrl(contextQuestionRequest.getImageUrl())
                                .paragraph(contextQuestionRequest.getParagraph())
                                .transcript(contextQuestionRequest.getTranscript())
                                .test(savedTest)
                                .part(part)
                                .build();
                        ContextQuestion savedContextQuestion = contextQuestionRepository.save(contextQuestion);
                        for(QuestionRequest questionRequest: contextQuestionRequest.getQuestions())
                        {
                            char correctAns = 'A';
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
                                    .build();
                            questionRepository.save(question);
                        }
                    }
                }
            }
        }
    }
}
