package org.ziyad.login.chatcanal;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Controller
@RequiredArgsConstructor
public class ChatCanalController {

    private final ChatCanalService service;

    @PostMapping("/canal.new")
    public ResponseEntity<Boolean> createChatCanal(@RequestBody List<String> recipients) {
        return ResponseEntity.ok(service.createChatCanal(recipients));
    }

    @DeleteMapping("/canal.delete/{canalId}")
    public void deleteChatCanal(@PathVariable("canalId") String canalId) {
        service.deleteChatCanal(canalId);
    }

    @PutMapping("/canal.add/{canalId}/{newRecipient}")
    public void addRecipient(
            @PathVariable("canalId") String canalId,
            @PathVariable("newRecipient") String username) {
        service.addRecipient(canalId, username);
    }

    @GetMapping("/canal.find")
    public ResponseEntity<ChatCanal> findByCanalNameAndRecipients(@RequestBody ChatCanal chatCanal) {
        return ResponseEntity.ok(service.findByCanalNameAndRecipients(chatCanal.getCanalName(), chatCanal.getRecipients()));
    }

    @GetMapping("/canal.find/{canalName}")
    public ResponseEntity<ChatCanal> findByCanalName(@PathVariable("canalName") String canalName) {
        return ResponseEntity.ok(service.findByCanalName(canalName));
    }

    @GetMapping("/canal.infos/{canalId}")
    public ResponseEntity<ChatCanal> findById(@PathVariable("canalId") String canalId) {
        return ResponseEntity.ok(service.findById(canalId));
    }

}
