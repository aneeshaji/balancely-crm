<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Balancely CRM — Accounts Panel</title>
    <meta name="description" content="Account staff management panel for Balancely CRM daily activity tracking.">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">

    {{-- DNS prefetch for external resources --}}
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">

    {{-- Preconnect to fonts origin BEFORE browser parses the stylesheet --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    {{-- Load only weights we actually use (500, 600, 700) + display=swap prevents FOIT --}}
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&display=swap" rel="stylesheet">

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body>
    <div id="app"></div>
    <script>
        // Set CSRF token globally for all fetch calls
        window._CSRF_TOKEN = "{{ csrf_token() }}";
    </script>
</body>
</html>
