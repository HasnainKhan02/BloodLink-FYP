<?php

namespace App\Helpers;

class BloodTypeHelper
{
    /**
     * Returns an array of compatible donor blood types for a given patient's blood type.
     */
    public static function getCompatibleDonorTypes(string $patientBloodType): array
    {
        $patientBloodType = strtoupper(trim($patientBloodType));

        $compatibilityMap = [
            'A+'  => ['A+', 'A-', 'O+', 'O-'],
            'A-'  => ['A-', 'O-'],
            'B+'  => ['B+', 'B-', 'O+', 'O-'],
            'B-'  => ['B-', 'O-'],
            'AB+' => ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            'AB-' => ['AB-', 'A-', 'B-', 'O-'],
            'O+'  => ['O+', 'O-'],
            'O-'  => ['O-'],
        ];

        return $compatibilityMap[$patientBloodType] ?? [];
    }
}
