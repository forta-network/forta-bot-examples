from forta_agent import Finding, FindingType, FindingSeverity
import forta_agent
import gnupg
import sys
import json
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
    key_data = open('private.pem').read()
    import_result = gpg.import_keys(key_data)
    logging.info(f"Imported keys: {import_result}")
    gpg.trust_keys("8C5D6E8F76F677FF879A44C8A84BD614456EDBDF", 'TRUST_ULTIMATE')
    
    private_keys = gpg.list_keys(True)
    logging.info(f"Got private keys: {private_keys}")

    subscription_json = []
    subscription_json.append({"botId": "0xf403400c4bd908e81853e8219c9e3980447760808d84c1f9fb724bce24540f07"})

    alert_config = {"alertConfig": {"subscriptions": subscription_json}}
    logging.info("Initialized")

    return alert_config


def handle_alert(alert_event: forta_agent.alert_event.AlertEvent) -> list:
    findings = []

    logging.info(f"Got alert event: {alert_event.alert_hash}")

    encrypted_finding_base64 = alert_event.alert.metadata['data']
    logging.info(f"Got encrypted base64 encoded finding: {encrypted_finding_base64}")
    encrypted_finding_ascii = base64.b64decode(encrypted_finding_base64)
    logging.info(f"Decoded finding")

    decrypted_finding_json = gpg.decrypt(encrypted_finding_ascii)
    logging.info(f"Decrypted finding: {decrypted_finding_json}")

    finding_dict = json.loads(str(decrypted_finding_json))
    logging.info(f"Converted json into finding dict")

    finding_dict['severity'] = FindingSeverity.Low
    finding_dict['type'] = FindingType.Info

    finding = Finding(finding_dict)
    logging.info(f"Converted json into finding object")

    findings.append(finding)

    return findings
