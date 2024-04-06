package org.ziyad.login.chatcanal;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ChatCanalService {

    private final ChatCanalRepository repository;

    public boolean createChatCanal(List<String> recipients) {
        if (recipients.size() == 2) {
            // one-to-one communication

            //check if canal already exists
            String name1 = String.format("%s_%s", recipients.get(0), recipients.get(1));
            String name2 = String.format("%s_%s", recipients.get(1), recipients.get(0));
            List<ChatCanal> existingCanals1 = repository.findByCanalName(name1);
            List<ChatCanal> existingCanals2 = repository.findByCanalName(name2);

            if (!(existingCanals1.isEmpty() && existingCanals2.isEmpty())) {
                return false; // canal already exists => creation failed
            }
        }

        ChatCanal chatCanal = new ChatCanal();
        chatCanal.setRecipients(new HashSet<>(recipients));
        chatCanal.setCanalName(String.format("%s_%s", recipients.get(0), recipients.get(1)));
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

    public List<ChatCanal> findByCanalNameAndRecipients(String canalName, Set<String> recipients) {
        List<ChatCanal> chatCanals = repository.findByCanalNameAndRecipients(canalName, recipients);
        if (recipients.size() == 2 && chatCanals.isEmpty()) {
            String[] users = canalName.split("_");
            String alternativeName = users[1] + "_" + users[0];
            chatCanals = repository.findByCanalNameAndRecipients(alternativeName, recipients);
        }
        return chatCanals;
    }

    public ChatCanal findById(String canalId) {
        return repository.findByCanalId(canalId);
    }
}
