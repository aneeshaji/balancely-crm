<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
        $exceptions->report(function (\Throwable $e) {
            // Only log system/database errors to prevent noise from user errors
            if ($e instanceof \Illuminate\Validation\ValidationException || 
                $e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException ||
                $e instanceof \Illuminate\Auth\AuthenticationException ||
                $e instanceof \Illuminate\Auth\Access\AuthorizationException ||
                $e instanceof \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException) {
                return;
            }

            try {
                \App\Models\AuditLog::record(
                    'system.error',
                    "System Error: " . $e->getMessage(),
                    [
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                        'trace' => substr($e->getTraceAsString(), 0, 1000),
                    ]
                );
            } catch (\Throwable $loggingError) {
                // Fail silently to avoid infinite loop
            }
        });
    })->create();
