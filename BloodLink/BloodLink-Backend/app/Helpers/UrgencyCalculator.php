<?php

namespace App\Helpers;

class UrgencyCalculator
{
    public static function calculate(string $urgencyLevel, int $neededWithinHours): int
    {
        $baseScore = match ($urgencyLevel) {
            'critical_icu'   => 70,
            'urgent_surgery' => 40,
            'routine'        => 10,
            default          => 10,
        };

        // Fewer remaining hours = higher urgency weight
        $timeWeight = max(0, (48 - $neededWithinHours) * 0.6);

        return (int) min(100, round($baseScore + $timeWeight));
    }
}
