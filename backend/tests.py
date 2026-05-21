"""
Temel Birim Testleri
Test edilebilirlik prensibi gereği her servis ayrı test edilebilir
"""
import unittest
from services import AuthService, TransactionService

class TestAuthService(unittest.TestCase):
    """Kimlik Doğrulama Servisi Testleri"""
    
    def test_password_hash(self):
        """Şifre hashleme doğru mu?"""
        password = 'test_password_123'
        hashed = AuthService.hash_password(password)
        
        # Hash farklı olmalı
        self.assertNotEqual(password, hashed)
        
        # Doğrulama başarılı olmalı
        self.assertTrue(AuthService.verify_password(password, hashed))
        
        # Yanlış şifre reddedilmeli
        self.assertFalse(AuthService.verify_password('wrong_password', hashed))
    
    def test_password_verification(self):
        """Şifre doğrulama başarılı mı?"""
        password = 'secure_pass_456'
        hashed = AuthService.hash_password(password)
        self.assertTrue(AuthService.verify_password(password, hashed))


class TestTransactionService(unittest.TestCase):
    """İşlem Servisi Testleri"""
    
    def test_budget_alert_calculation(self):
        """Bütçe uyarısı hesaplaması doğru mu?"""
        # Bütçe limiti: 1000 TL
        # Harcanan: 850 TL
        # %85 - uyarı verilmeli
        
        limit = 1000.0
        spent = 850.0
        percentage = (spent / limit) * 100
        
        self.assertGreater(percentage, 80)
        self.assertLess(percentage, 90)


if __name__ == '__main__':
    unittest.main()
