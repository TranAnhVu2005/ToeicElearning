package com.ctu_cit_nienLuanNganh.toeicLearning.module.classroom.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class ClassroomInvitationResponse {
    int totalProcessed;
    int emailedCount;
    int autoApprovedCount;
    int alreadyMemberCount;
    boolean mailConfigured;
    List<String> invitedEmails;
}
