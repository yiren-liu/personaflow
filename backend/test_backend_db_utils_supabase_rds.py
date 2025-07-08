import unittest
from unittest.mock import patch, MagicMock
from db_utils.supabase_rds import RDSClient
from tasks.tasks import send_email
from tasks.email.render import render_template
class TestRDSClient(unittest.TestCase):

    @patch('db_utils.supabase_rds.create_client')
    def test_get_all_user_email_newsletter_subscribed(self, mock_create_client):
        # Mock the Supabase client
        mock_client = MagicMock()
        mock_create_client.return_value = mock_client

        # Mock the response from the database
        mock_response = MagicMock()
        mock_response.data = [{"user_id": "user123", "email": "user123@example.com"}]
        mock_client.from_.return_value.select.return_value.eq.return_value.execute.return_value = mock_response

        # Initialize the RDSClient
        rds_client = RDSClient()

        # Call the method
        result = rds_client.get_all_user_email_newsletter_subscribed()
        print(result)

        # Assertions
        self.assertEqual(result, mock_response.data)
        mock_client.from_.assert_called_with("user_settings_with_email")
        mock_client.from_().select.assert_called_with("user_id, email")
        mock_client.from_().select().eq.assert_called_with("is_newsletter_subscribed", True)
        mock_client.from_().select().eq().execute.assert_called_once()
    
    # def test_send_email(self):
    #     email = "yirenl2@illinois.edu"
    #     send_email("Newsletter", "Here is the newsletter", email)

    def test_send_email_with_html(self):
        email = "yirenl2@illinois.edu"
        html = render_template("template_1", newsletter_title="Hello World!")
        send_email("[TEST] Newsletter", "", email, html_body=html)

    # def test_render_template(self):
    #     html = render_template("template_1", newsletter_title="Hello World!")
        # print(html)
        # write to file
        # with open("test_template.html", "w") as file:
        #     file.write(html)
        
        

if __name__ == '__main__':
    unittest.main()
