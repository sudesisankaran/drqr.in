import requests
import uuid
import os

BASE_URL = "http://127.0.0.1:8000"

def test_full_workflow():
    print("=== STARTING FULL END-TO-END PATIENT WORKFLOW TEST ===")
    
    # 1. Register a new patient
    unique_suffix = uuid.uuid4().hex[:6]
    patient_email = f"patient_{unique_suffix}@healthcare.org"
    patient_payload = {
        "email": patient_email,
        "password": "Password123!",
        "confirm_password": "Password123!",
        "role": "patient",
        "full_name": f"Patient {unique_suffix.upper()}",
        "phone": "9876543210",
        "address": "123 Health Ave",
        "city": "Chennai",
        "district": "Chennai",
        "state": "Tamil Nadu",
        "pincode": "600001",
    }
    
    print(f"\n[1] Registering patient: {patient_email}...")
    reg_res = requests.post(f"{BASE_URL}/api/auth/register/patient/", json=patient_payload)
    assert reg_res.status_code == 201, f"Registration failed ({reg_res.status_code}): {reg_res.text}"
    reg_data = reg_res.json()
    token = reg_data["tokens"]["access"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"-> Registration SUCCESS. Reference ID: {reg_data.get('patient_profile', {}).get('patient_reference_id')}")

    # 2. Verify Profile (/api/patients/me/)
    print("\n[2] Fetching patient profile (/api/patients/me/)...")
    prof_res = requests.get(f"{BASE_URL}/api/patients/me/", headers=headers)
    prof_json = prof_res.json()
    prof_data = prof_json.get("data", prof_json)
    assert prof_data["patient_reference_id"].startswith("PAT-")
    print(f"-> Profile verified: {prof_data['patient_reference_id']}, Phone: {prof_data['phone']}")

    # 3. Add Hospital Details (/api/patient-hospitals/)
    print("\n[3] Adding Hospital Details (/api/patient-hospitals/)...")
    hosp_payload = {
        "hospital_name": "Apollo Speciality Hospital",
        "registration_number": f"REG-{unique_suffix.upper()}",
        "hospital_type": "Multi-Specialty Private",
        "specialization": "Cardiology & General Medicine",
        "address": "21 Greams Road",
        "city": "Chennai",
        "district": "Chennai",
        "state": "Tamil Nadu",
        "pincode": "600006",
        "contact_number": "044-28290200",
        "official_email": "apollo@chennaihealth.org",
        "doctor_in_charge": "Dr. K. Srinivasan",
        "visit_date": "2024-10-15",
        "additional_notes": "Annual cardiac health review"
    }
    hosp_res = requests.post(f"{BASE_URL}/api/patient-hospitals/", json=hosp_payload, headers=headers)
    assert hosp_res.status_code == 201, f"Add hospital failed: {hosp_res.text}"
    hosp_data = hosp_res.json()
    hosp_id = hosp_data["id"]
    print(f"-> Hospital created successfully! ID: {hosp_id}, Name: {hosp_data['hospital_name']}")

    # 4. Verify Dashboard Stats
    print("\n[4] Fetching dashboard stats (/api/patients/dashboard-stats/)...")
    stats_res = requests.get(f"{BASE_URL}/api/patients/dashboard-stats/", headers=headers)
    assert stats_res.status_code == 200, f"Stats failed: {stats_res.text}"
    stats_data = stats_res.json()
    assert stats_data["total_hospitals"] == 1
    assert stats_data["total_documents"] == 0
    print(f"-> Dashboard stats verified: {stats_data['total_hospitals']} hospitals, {stats_data['total_documents']} documents")

    # 5. Upload Medical Record (/api/medical-records/)
    print("\n[5] Uploading Medical Record (/api/medical-records/)...")
    pdf_path = os.path.join(os.path.dirname(__file__), "scratch_test_report.pdf")
    with open(pdf_path, "rb") as f:
        files = {"file": ("ecg_report.pdf", f, "application/pdf")}
        data = {
            "hospital_record": hosp_id,
            "title": "ECG & Blood Chemistry",
            "category": "Lab Report",
            "record_date": "2024-10-15",
            "description": "Sinus rhythm normal, lipid profile in normal limits",
            "reference_number": "REF-CARDIO-889"
        }
        upload_res = requests.post(f"{BASE_URL}/api/medical-records/", files=files, data=data, headers=headers)
    assert upload_res.status_code == 201, f"Upload failed: {upload_res.text}"
    doc_json = upload_res.json()
    doc_data = doc_json.get("data", doc_json)
    doc_id = doc_data["id"]
    print(f"-> Document uploaded successfully! ID: {doc_id}, Title: {doc_data['title']}, Storage Path: {doc_data['storage_path']}")

    # 6. Verify Dashboard Stats after upload
    stats_res2 = requests.get(f"{BASE_URL}/api/patients/dashboard-stats/", headers=headers)
    assert stats_res2.status_code == 200
    stats_data2 = stats_res2.json()
    assert stats_data2["total_documents"] == 1
    print(f"-> Updated stats verified: {stats_data2['total_documents']} total uploaded documents")

    # 7. Download/Stream Medical Document (/api/medical-records/<uuid>/download/)
    print(f"\n[7] Downloading/Streaming Medical Document (/api/medical-records/{doc_id}/download/)...")
    down_res = requests.get(f"{BASE_URL}/api/medical-records/{doc_id}/download/", headers=headers)
    assert down_res.status_code == 200, f"Download failed ({down_res.status_code}): {down_res.text}"
    assert len(down_res.content) > 0
    print(f"-> Document stream verified: {len(down_res.content)} bytes received, Content-Type: {down_res.headers.get('Content-Type')}")

    # 8. Test Data Privacy & Isolation (Another patient cannot access this record)
    print("\n[8] Testing Cross-Patient Privacy & Isolation...")
    other_patient_payload = {
        "email": f"other_{unique_suffix}@healthcare.org",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "role": "patient",
        "full_name": "Unauthorized Intruder",
        "phone": "9123456789",
        "address": "99 Intruder Blvd",
        "city": "Chennai",
        "district": "Chennai",
        "state": "Tamil Nadu",
        "pincode": "600009"
    }
    other_reg = requests.post(f"{BASE_URL}/api/auth/register/patient/", json=other_patient_payload)
    assert other_reg.status_code == 201, f"Other patient registration failed: {other_reg.text}"
    other_token = other_reg.json()["tokens"]["access"]
    other_headers = {"Authorization": f"Bearer {other_token}"}

    # Intruder tries to access doc
    intrude_res = requests.get(f"{BASE_URL}/api/medical-records/{doc_id}/download/", headers=other_headers)
    assert intrude_res.status_code == 404, f"Security breach! Intruder accessed doc: {intrude_res.status_code}"
    
    # Intruder tries to get hospital
    intrude_hosp = requests.get(f"{BASE_URL}/api/patient-hospitals/{hosp_id}/", headers=other_headers)
    assert intrude_hosp.status_code == 404, f"Security breach! Intruder accessed hospital: {intrude_hosp.status_code}"
    print("-> Privacy & Isolation verified: Unauthorized patient gets 404 Not Found.")

    # 9. Update Metadata (/api/medical-records/<uuid>/)
    print("\n[9] Updating Medical Record Metadata (PATCH)...")
    patch_res = requests.patch(f"{BASE_URL}/api/medical-records/{doc_id}/", json={"title": "Updated ECG Report"}, headers=headers)
    assert patch_res.status_code == 200, f"Patch failed: {patch_res.text}"
    patch_data = patch_res.json().get("data", patch_res.json())
    assert patch_data["title"] == "Updated ECG Report"
    print("-> Metadata update verified!")

    # 10. Delete Medical Document (/api/medical-records/<uuid>/)
    print("\n[10] Deleting Medical Document (DELETE)...")
    del_res = requests.delete(f"{BASE_URL}/api/medical-records/{doc_id}/", headers=headers)
    assert del_res.status_code in (200, 204), f"Delete failed: {del_res.status_code}"
    
    # Confirm it's gone
    confirm_del = requests.get(f"{BASE_URL}/api/medical-records/{doc_id}/", headers=headers)
    assert confirm_del.status_code == 404
    print("-> Document deleted successfully and verified gone!")

    print("\n=======================================================")
    print("ALL 10 PATIENT WORKFLOW TESTS PASSED WITH 100% SUCCESS!")
    print("=======================================================\n")

if __name__ == "__main__":
    test_full_workflow()
