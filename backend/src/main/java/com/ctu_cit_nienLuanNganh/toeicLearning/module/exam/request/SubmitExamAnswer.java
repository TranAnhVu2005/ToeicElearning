package com.ctu_cit_nienLuanNganh.toeicLearning.module.exam.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SubmitExamAnswer {
    @NotBlank(message = "Khóa gửi bài không được để trống")
    @Pattern(regexp = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
    private String submissionKey;

    @NotBlank(message = "ID bài thi không được để trống")
    private String testId;

    @NotBlank(message = "ID phiên làm bài không được để trống")
    @Size(max = 36)
    private String sessionId;

    @Size(max = 36)
    private String assignmentId;

    @Size(max = 36)
    private String sourceResultId;

    @Size(max = 200)
    private List<@NotBlank String> questionIds;

    // Nếu làm fulltest thì partId là null, còn nếu không thì sẽ điền partId vào
    private String partId;

    @NotNull(message = "Thời gian làm bài không được để trống")
    @Min(0)
    @Max(7200)
    private Integer totalTime;
    @Size(max = 7)
    private List<String> partIds;
    @Size(max = 7)
    private List<Integer> partNumbers;
    @Valid
    @Size(max = 200)
    private List<SingleAnswerRequest> answers;

    @Getter
    @Setter
    public static class SingleAnswerRequest{
        @NotBlank
        private String questionId;
        private Character selectedAnswer;
    }
}
