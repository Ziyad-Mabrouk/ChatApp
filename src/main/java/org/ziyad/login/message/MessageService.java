package org.ziyad.login.message;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository repository;

    public Message sendMessage(Message message) {
        // Get the current date and time as msg timestamp
        LocalDateTime currentDateTime = LocalDateTime.now();
        message.setTimestamp(currentDateTime);
        repository.save(message);
        return message;
    }

    public List<Message> fetchMessages(String canalId) {
        return repository.findByCanalId(canalId);
    }
}
