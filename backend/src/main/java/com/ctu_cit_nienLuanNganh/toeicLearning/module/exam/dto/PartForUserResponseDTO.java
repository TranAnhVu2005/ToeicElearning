package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.dto;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.BaseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.ContextQuestion;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Getter
@Setter
@SuperBuilder
public class PartForUserResponseDTO extends BaseDTO {
    private String nameTest;
    private String namePart;
    private List<ContextQuestion> contextQuestionList;
}
