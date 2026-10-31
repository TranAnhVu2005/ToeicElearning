package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SaveExamSessionAnswersRequest {
    @Valid
    @Size(max = 200)
    private List<SubmitExamAnswer.SingleAnswerRequest> answers;
}
