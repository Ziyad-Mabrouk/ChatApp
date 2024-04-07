package org.ziyad.login.chatcanal;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ChatCanalService {

    private final ChatCanalRepository repository;

    // for one-to-one communications => canal naming is based on recipients
    public boolean createChatCanal(List<String> recipients) {
        // sort recipients alphabetically to avoid problems later on
        recipients.sort(String::compareTo);
        String canalName = String.join("_", recipients);
        System.out.println(canalName);

        ChatCanal existingCanal = repository.findByCanalName(canalName);
        if (existingCanal != null) {
            return false; // Canal already exists => creation failed
        }

        ChatCanal chatCanal = new ChatCanal();
        chatCanal.setRecipients(new HashSet<>(recipients));
        chatCanal.setCanalName(canalName);
        repository.save(chatCanal);
        return true;
    }

    // in general (will be used later on)
    public boolean createChatCanal(String canalName, List<String> recipients) {
        // sort recipients alphabetically to avoid problems later on
        recipients.sort(String::compareTo);
        ChatCanal existingCanal = repository.findByCanalName(canalName);
        if (existingCanal != null) {
            return false; // Canal already exists => creation failed
        }
        ChatCanal chatCanal = new ChatCanal();
        chatCanal.setRecipients(new HashSet<>(recipients));
        chatCanal.setCanalName(canalName);
        repository.save(chatCanal);
        return true;
    }
    public void deleteChatCanal(String canalId) {
        repository.findById(canalId).ifPresent(repository::delete);
    }

    public void addRecipient(String canalId, String username) {
        var storedCanal = repository.findById(canalId).orElse(null);
        if (storedCanal != null) {
            Set<String> recipients = storedCanal.getRecipients();
            recipients.add(username);
            storedCanal.setRecipients(recipients);
            repository.save(storedCanal);
        }
    }

    public ChatCanal findByCanalNameAndRecipients(String canalName, Set<String> recipients) {
        List<String> sortedRecipients = new ArrayList<>(recipients);
        Collections.sort(sortedRecipients);
        return repository.findByCanalNameAndRecipients(canalName, new HashSet<>(sortedRecipients));
    }

    public ChatCanal findByCanalName(String canalName) {
        return repository.findByCanalName(canalName);
    }

    public ChatCanal findById(String canalId) {
        return repository.findByCanalId(canalId);
    }
}
