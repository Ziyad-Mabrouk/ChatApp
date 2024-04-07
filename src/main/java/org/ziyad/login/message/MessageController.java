package org.ziyad.login.message;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.ziyad.login.chatcanal.ChatCanal;
import org.ziyad.login.chatcanal.ChatCanalService;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class MessageController {

    private final SimpMessagingTemplate template;
    private final MessageService messageService;
    private final ChatCanalService canalService;

    @MessageMapping("/chat")
    public void processMessage(Message message) {
        Message storedMessage = messageService.sendMessage(message);

        // real-time notifications => send notification to every recipient
        ChatCanal canal = canalService.findById(message.getCanalId());
        if (canal == null) {return;}
        List<String> recipients = canal.getRecipients().stream().toList();
        for (String recipient:recipients) {
            if (!recipient.equals(message.getSender())) {
                template.convertAndSendToUser(
                        recipient,
                        "/queue/messages",
                        Notification.builder()
                                .id(storedMessage.getMessageId())
                                .sender(message.getSender())
                                .recipient(recipient)
                                .content(storedMessage.getContent())
                                .build()
                );
            }
        }
    }

    @GetMapping ("/messages/{canalId}")
    public ResponseEntity<List<Message>> fetchMessages(@PathVariable("canalId") String canalId) {
        return ResponseEntity.ok(messageService.fetchMessages(canalId));
    }
}
