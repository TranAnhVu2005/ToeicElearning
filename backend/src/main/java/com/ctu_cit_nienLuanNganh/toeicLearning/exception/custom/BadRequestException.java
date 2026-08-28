package com.ctu_cit_nienLuanNganh.toeicLearning.exception.custom;

import lombok.Getter;

import java.util.Map;

@Getter
public class BadRequestException extends RuntimeException{
    private final Map<String, String> data;

    public BadRequestException(String message)
    {
        super(message);
        this.data = null;
    }

    public BadRequestException(String message, Map<String, String> data)
    {
        super(message);
        this.data = data;
    }
}
