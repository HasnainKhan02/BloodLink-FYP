<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Conversation;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});


Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);

    if (!$conversation) {
        return false;
    }

    $isParticipant = (int) $user->id === (int) $conversation->requester_id ||
                     (int) $user->id === (int) $conversation->donor_id;

    if ($isParticipant) {
        return ['id' => $user->id, 'name' => $user->name];
    }

    return false;
});
