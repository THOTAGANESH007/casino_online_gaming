import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Environment, FileSystemLoader
from pathlib import Path
from app.core.config import settings

template_dir = Path(__file__).resolve().parents
env = Environment(loader=FileSystemLoader(template_dir))


def send_email(
    to_email: str,
    subject: str,
    template_name: str,
    context: dict
) -> bool:
    try:
        template = env.get_template(template_name)
        html_content = template.render(**context)

        msg = MIMEMultipart("alternative")
        msg["From"] = settings.EMAIL_FROM or settings.EMAIL_USERNAME
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
            server.starttls()
            server.login(settings.EMAIL_USERNAME, settings.EMAIL_PASSWORD)
            server.sendmail(msg["From"], to_email, msg.as_string())

        return True

    except Exception as e:
        print("Email sending failed:", e)
        return False