package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto;

import java.time.Instant;

public record MaterialDownloadResponse(String url, Instant expiresAt) { }
