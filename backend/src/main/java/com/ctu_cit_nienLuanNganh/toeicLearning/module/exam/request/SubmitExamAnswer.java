package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SubmitExamAnswer {
    @NotNull(message = "ID bài thi không được để trống")
    private String testId;

    // Nếu làm fulltest thì partId là null, còn nếu không thì sẽ điền partId vào
    private String partId;

    @NotNull(message = "Thời gian làm bài không được để trống")
    private Integer totalTime;
    private List<SingleAnswerRequest> answers;

    @Getter
    @Setter
    public static class SingleAnswerRequest{
        private String questionId;
        private Character selectedAnswer;
    }
}
