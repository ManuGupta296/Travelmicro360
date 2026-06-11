package com.example.notificationservice.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="notifications")
public class Notification extends AuditableEntity {
    public enum Type { BOOKING_CONFIRMED, PAYMENT_RECEIVED, BOOKING_CANCELLED, REMINDER, SYSTEM }
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long notificationId;
    @Column(nullable=false) private Long userId;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=30) private Type type;
    @Column(nullable=false,length=200) private String title;
    @Column(columnDefinition="TEXT") private String message;
    private Boolean isRead = false;
    private LocalDateTime sentAt;
    public Notification(){}
    public Long getNotificationId(){return notificationId;} public void setNotificationId(Long v){this.notificationId=v;}
    public Long getUserId(){return userId;} public void setUserId(Long v){this.userId=v;}
    public Type getType(){return type;} public void setType(Type v){this.type=v;}
    public String getTitle(){return title;} public void setTitle(String v){this.title=v;}
    public String getMessage(){return message;} public void setMessage(String v){this.message=v;}
    public Boolean getIsRead(){return isRead;} public void setIsRead(Boolean v){this.isRead=v;}
    public LocalDateTime getSentAt(){return sentAt;} public void setSentAt(LocalDateTime v){this.sentAt=v;}
}