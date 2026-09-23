<?php

use Illuminate\Support\Facades\Artisan;
use Mailtrap\Helper\ResponseHelper;
use Mailtrap\MailtrapClient;
use Mailtrap\Mime\MailtrapEmail;
use Symfony\Component\Mime\Address;

Artisan::command('send-mail {recipient?}', function ($recipient = 'hk4547124@gmail.com') {
    $apiKey = config('services.mailtrap.api_key');
    $senderEmail = config('services.mailtrap.sender_email');
    $senderName = config('services.mailtrap.sender_name');

    if (empty($apiKey)) {
        $this->error('MAILTRAP_API_KEY is not set in your .env file!');
        return;
    }

    $email = (new MailtrapEmail())
        ->from(new Address($senderEmail, $senderName))
        ->to(new Address($recipient))
        ->subject('BloodLink - Password Reset / Notification Test')
        ->category('Integration Test')
        ->text('Congrats! Your Mailtrap API integration with BloodLink Laravel is working successfully!');

    try {
        $response = MailtrapClient::initSendingEmails(
            apiKey: $apiKey
        )->send($email);

        $responseData = ResponseHelper::toArray($response);
        $this->info('Email sent successfully!');
        $this->line(json_encode($responseData, JSON_PRETTY_PRINT));
    } catch (\Exception $e) {
        $this->error('Failed to send email: ' . $e->getMessage());
    }
})->purpose('Send a test email using Mailtrap API');
