package com.ctu_cit_nienLuanNganh.toeicLearning.common.dto;

public final class ApiViews {
    private ApiViews() { }
    public interface Public { }
    public interface ExamDetail extends Public { }
    public interface Admin extends ExamDetail { }
}
