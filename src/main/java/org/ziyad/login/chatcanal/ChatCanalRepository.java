package org.ziyad.login.chatcanal;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Set;

public interface ChatCanalRepository extends MongoRepository<ChatCanal, String> {
    List<ChatCanal> findByCanalName(String canalName);
    ChatCanal findByCanalId(String canalId);
    List<ChatCanal> findByCanalNameAndRecipients(String canalName, Set<String> recipients);
}
