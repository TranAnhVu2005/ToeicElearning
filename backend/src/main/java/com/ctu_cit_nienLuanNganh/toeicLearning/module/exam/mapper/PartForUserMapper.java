package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.mapper;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.ContextQuestion;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Part;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Test;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto.PartForUserResponseDTO;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PartForUserMapper {
    public PartForUserResponseDTO toDTO(Test test, Part part, List<ContextQuestion> contextQuestionList){
        return PartForUserResponseDTO
                .builder()
                .nameTest(test.getTitleTest())
                .namePart(part.getNamePart())
                .contextQuestionList(contextQuestionList)
                .build();
    }
}
