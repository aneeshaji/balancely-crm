<?php

namespace App\Observers;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

class AuditObserver
{
    /**
     * Handle the Model "created" event.
     */
    public function created(Model $model): void
    {
        $modelName = class_basename($model);
        $user = auth()->user();
        $userName = $user ? $user->name : 'System/Guest';
        $identifier = $this->getIdentifier($model);

        $payload = $model->getAttributes();
        // Redact sensitive attributes
        $payload = $this->redactSensitive($payload);

        AuditLog::record(
            strtolower($modelName) . '.created',
            "{$userName} created {$modelName} ({$identifier}).",
            $payload
        );
    }

    /**
     * Handle the Model "updated" event.
     */
    public function updated(Model $model): void
    {
        $modelName = class_basename($model);
        $user = auth()->user();
        $userName = $user ? $user->name : 'System/Guest';
        $identifier = $this->getIdentifier($model);

        $changes = [];
        $dirty = $model->getDirty();

        foreach ($dirty as $key => $value) {
            // Skip timestamp updates unless it's the only change
            if (in_array($key, ['updated_at', 'last_login_at'])) {
                continue;
            }

            $oldValue = $model->getOriginal($key);
            $newValue = $value;

            // Redact password or other sensitive info
            if (in_array($key, ['password', 'remember_token'])) {
                $oldValue = '[REDACTED]';
                $newValue = '[REDACTED]';
            }

            $changes[$key] = [
                'old' => $oldValue,
                'new' => $newValue,
            ];
        }

        // If no non-timestamp fields changed, skip logging
        if (empty($changes)) {
            return;
        }

        AuditLog::record(
            strtolower($modelName) . '.updated',
            "{$userName} updated {$modelName} ({$identifier}).",
            [
                'changes' => $changes,
                'original' => $this->redactSensitive(array_intersect_key($model->getOriginal(), $changes))
            ]
        );
    }

    /**
     * Handle the Model "deleted" event.
     */
    public function deleted(Model $model): void
    {
        $modelName = class_basename($model);
        $user = auth()->user();
        $userName = $user ? $user->name : 'System/Guest';
        $identifier = $this->getIdentifier($model);

        $payload = $model->getAttributes();
        $payload = $this->redactSensitive($payload);

        AuditLog::record(
            strtolower($modelName) . '.deleted',
            "{$userName} deleted {$modelName} ({$identifier}).",
            $payload
        );
    }

    /**
     * Helper to get a human-readable identifier for the model.
     */
    protected function getIdentifier(Model $model): string
    {
        if (isset($model->name)) {
            return $model->name;
        }
        if (isset($model->title)) {
            return $model->title;
        }
        if (isset($model->cheque_no)) {
            return "Cheque #" . $model->cheque_no;
        }
        if (isset($model->reference_number)) {
            return "Ref: " . $model->reference_number;
        }
        if (isset($model->amount)) {
            return "Amount: " . $model->amount;
        }
        return "ID: " . $model->id;
    }

    /**
     * Helper to redact sensitive keys in payload arrays.
     */
    protected function redactSensitive(array $data): array
    {
        $sensitiveKeys = ['password', 'remember_token'];
        foreach ($sensitiveKeys as $key) {
            if (array_key_exists($key, $data)) {
                $data[$key] = '[REDACTED]';
            }
        }
        return $data;
    }
}
