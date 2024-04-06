package org.ziyad.login.message;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Notification {
    private String id;
    private String sender;
    private String recipient;
    private String content;
}
