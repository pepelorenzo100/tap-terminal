<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/*
|--------------------------------------------------------------------------
| TAP TERMINAL - PASSWORD RESET MAIL
|--------------------------------------------------------------------------
|
| Archivo:
|
|     backend/app/Mail/PasswordResetMail.php
|
| Responsabilidad:
|
|     Construir el correo electrónico utilizado para recuperar
|     la contraseña de un usuario.
|
| Flujo:
|
|     AuthController
|          ↓
|     PasswordResetMail
|          ↓
|     resources/views/emails/password-reset.blade.php
|          ↓
|     SMTP / Mailer
|          ↓
|     Usuario
|
|--------------------------------------------------------------------------
*/

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;


    /**
     * ============================================================
     * DATOS DEL CORREO
     * ============================================================
     */

    public string $email;

    public string $token;

    public string $resetUrl;


    /**
     * ============================================================
     * CONSTRUCTOR
     * ============================================================
     *
     * Recibe la información generada por AuthController.
     *
     * @param string $email
     * @param string $token
     * @param string $resetUrl
     */
    public function __construct(
        string $email,
        string $token,
        string $resetUrl
    ) {
        $this->email = $email;

        $this->token = $token;

        $this->resetUrl = $resetUrl;
    }


    /**
     * ============================================================
     * SOBRE DEL CORREO
     * ============================================================
     *
     * Define el asunto del mensaje.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Recuperación de contraseña - TAP Terminal',
        );
    }


    /**
     * ============================================================
     * CONTENIDO DEL CORREO
     * ============================================================
     *
     * Utiliza:
     *
     *     resources/views/emails/password-reset.blade.php
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.password-reset',
        );
    }


    /**
     * ============================================================
     * ARCHIVOS ADJUNTOS
     * ============================================================
     */
    public function attachments(): array
    {
        return [];
    }
}