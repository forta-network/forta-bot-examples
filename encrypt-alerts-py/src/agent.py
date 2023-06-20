from forta_agent import Finding, FindingType, FindingSeverity
import gnupg
import sys
import random
import logging
import base64

gpg = None

root = logging.getLogger()
root.setLevel(logging.INFO)

handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
root.addHandler(handler)

def initialize():
    global gpg

    gpg = gnupg.GPG(gnupghome='.')
    key_data = open('public.pem').read()
    import_result = gpg.import_keys(key_data)
    logging.info(f"Imported keys: {import_result}")
    gpg.trust_keys("8C5D6E8F76F677FF879A44C8A84BD614456EDBDF", 'TRUST_ULTIMATE')
    
    public_keys = gpg.list_keys()
    logging.info(f"Got public keys: {public_keys}")
    logging.info("Initialized")
   


def handle_transaction(transaction_event):
    global gpg

    findings = []

    r = random.random()
    if r < 0.0001:
        logging.info("Emmitting new finding")

        finding = Finding({
            'name': 'Random finding',
            'description': f'Random value: {r}',
            'alert_id': 'FORTA-1',
            'severity': FindingSeverity.Low,
            'type': FindingType.Info,
            'metadata': { }
        })
        finding_json = finding.toJson()
        public_keys = gpg.list_keys()
        logging.info(f"Got public keys: {public_keys}")
        encrypted_finding = gpg.encrypt(finding_json, "8C5D6E8F76F677FF879A44C8A84BD614456EDBDF")
        logging.info(f"OK: {encrypted_finding.ok}")
        logging.info(f"Status: {encrypted_finding.status}")
        logging.info(f"Stderr: {encrypted_finding.stderr}")
        encrypted_finding_ascii = str(encrypted_finding)
        logging.info(f"Got encrypted finding {encrypted_finding_ascii}")
        encrypted_finding_base64 = base64.b64encode(encrypted_finding_ascii.encode("utf-8")).decode("utf-8")
        logging.info(f"Got encrypted encoded finding {encrypted_finding_base64}")
        
        findings.append(Finding({
            'name': 'omitted',
            'description': f'omitted',
            'alert_id': 'omitted',
            'severity': FindingSeverity.Unknown,
            'type': FindingType.Unknown,
            'metadata': { 
                'data': encrypted_finding_base64
            }
        }))

    return findings
    

