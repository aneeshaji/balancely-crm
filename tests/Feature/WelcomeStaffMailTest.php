<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Designation;
use App\Mail\WelcomeStaffMail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class WelcomeStaffMailTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that the welcome email content renders correctly.
     */
    public function test_welcome_email_content(): void
    {
        $user = User::factory()->make([
            'name' => 'Jane Smith',
            'email' => 'jane@balancely.in',
        ]);
        $password = 'secret-password-123';

        $mailable = new WelcomeStaffMail($user, $password);

        $mailable->assertHasSubject('Welcome to Balancely CRM - Account Created');
        
        $rendered = $mailable->render();
        
        $this->assertStringContainsString('Hello Jane Smith,', $rendered);
        $this->assertStringContainsString('jane@balancely.in', $rendered);
        $this->assertStringContainsString('secret-password-123', $rendered);
    }

    /**
     * Test that the WelcomeStaffMail is dispatched when creating a staff member via the API.
     */
    public function test_welcome_email_is_sent_on_staff_creation(): void
    {
        Mail::fake();

        // Create designation to satisfy foreign key constraint
        $designation = Designation::create([
            'name' => 'Accountant',
            'description' => 'Test designation',
        ]);

        // Create an admin user and authenticate
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin.test@balancely.in',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $response = $this->actingAs($admin)->postJson('/api/staff', [
            'name' => 'Jane Doe',
            'email' => 'jane.doe@balancely.in',
            'password' => 'super-secure-pwd',
            'role' => 'staff',
            'designation_id' => $designation->id,
        ]);

        $response->assertStatus(201);

        // Verify the user exists in database
        $this->assertDatabaseHas('users', [
            'email' => 'jane.doe@balancely.in',
        ]);

        // Assert a WelcomeStaffMail was sent to the user
        Mail::assertSent(WelcomeStaffMail::class, function (WelcomeStaffMail $mail) {
            return $mail->user->email === 'jane.doe@balancely.in' &&
                   $mail->password === 'super-secure-pwd';
        });
    }

    /**
     * Test that the password reset endpoint updates the database and dispatches a Reset email.
     */
    public function test_password_reset_endpoint_updates_password_and_sends_email(): void
    {
        Mail::fake();

        // Create an admin user to authenticate
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin.test@balancely.in',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Create a staff user to reset
        $staff = User::create([
            'name' => 'Sarah Accounts',
            'email' => 'sarah.acc@balancely.in',
            'password' => bcrypt('old-password'),
            'role' => 'staff',
        ]);

        $response = $this->actingAs($admin)->postJson("/api/staff/{$staff->id}/reset-password", [
            'password' => 'new-secure-password-456',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Password reset successfully',
        ]);

        // Assert the database password is changed
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('new-secure-password-456', $staff->fresh()->password));

        // Assert a StaffResetPasswordMail was sent
        Mail::assertSent(\App\Mail\StaffResetPasswordMail::class, function (\App\Mail\StaffResetPasswordMail $mail) {
            return $mail->user->email === 'sarah.acc@balancely.in' &&
                   $mail->password === 'new-secure-password-456';
        });
    }
}
