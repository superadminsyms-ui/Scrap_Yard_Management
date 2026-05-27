package com.scrapyard.management.Exceptions;

public class BackupException extends RuntimeException {

    private final String userMessage;

    public BackupException(String userMessage, String technicalDetail) {
        super(technicalDetail);
        this.userMessage = userMessage;
    }

    public BackupException(String userMessage, String technicalDetail, Throwable cause) {
        super(technicalDetail, cause);
        this.userMessage = userMessage;
    }

    public String getUserMessage() {
        return userMessage;
    }
}
