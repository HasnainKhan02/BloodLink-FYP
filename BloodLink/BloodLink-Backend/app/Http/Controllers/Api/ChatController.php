<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\BloodRequest;
use App\Events\MessageSent;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    // Start or Fetch Conversation between Donor and Requester
    public function startConversation(Request $request)
    {
        $request->validate([
            'blood_request_id' => 'required|exists:blood_requests,id',
            'donor_id'         => 'required|exists:users,id',
        ]);

        $currentUserId = auth()->id();
        $bloodRequest = BloodRequest::findOrFail($request->blood_request_id);

        // Determine Requester ID and Donor ID correctly
        $requesterId = $bloodRequest->user_id ?? $bloodRequest->requester_id;
        $donorId = $request->donor_id;

        // If current logged-in user is the requester, donor_id is passed donor
        // If current logged-in user is donor, requester_id is request creator
        if ($currentUserId === $requesterId) {
            $donorId = $request->donor_id;
        } else {
            $donorId = $currentUserId;
        }

        $conversation = Conversation::firstOrCreate([
            'blood_request_id' => $request->blood_request_id,
            'requester_id'     => $requesterId,
            'donor_id'         => $donorId,
        ]);

        return response()->json([
            'status' => 'success',
            'data'   => $conversation->load(['requester:id,name', 'donor:id,name', 'messages.sender:id,name'])
        ]);
    }

    // Get All Messages in a Conversation
    public function getMessages($conversationId)
    {
        $conversation = Conversation::with([
            'requester:id,name',
            'donor:id,name',
            'messages.sender:id,name'
        ])->findOrFail($conversationId);

        return response()->json([
            'status' => 'success',
            'data'   => $conversation
        ]);
    }

    // Send Message
    public function sendMessage(Request $request, $conversationId)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $message = Message::create([
            'conversation_id' => $conversationId,
            'sender_id'       => auth()->id(),
            'message'         => $request->message,
        ]);

        $loadedMessage = $message->load('sender:id,name');

        // Broadcast Message via Reverb WebSocket (Removed .toOthers() so event fires properly)
        try {
            broadcast(new MessageSent($loadedMessage));
        } catch (\Exception $e) {
            \Log::error('Chat Broadcast Error: ' . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'data'   => $loadedMessage
        ]);
    }
}
