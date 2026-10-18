const API_URL = "http://localhost:8080/api/applications";

let currentStep = 1;
const totalSteps = 5;

const allowedFileTypes = ["application/pdf", "image/jpeg", "image/png"];

const maxFileSize = 5 * 1024 * 1024;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("applicationForm");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!validateStep(5)) {
      return;
    }

    await submitApplication();
  });

  setupFileValidation();

  updateDocumentRequirements();
  updateProgress();
});

function startApplication() {
  document.getElementById("welcomePage").classList.remove("active");

  document.getElementById("applicationPage").classList.add("active");

  currentStep = 1;

  updateProgress();
}

function startNewApplication() {
  document.getElementById("applicationForm").reset();

  clearFileNames();

  document.getElementById("successPage").classList.remove("active");

  document.getElementById("applicationPage").classList.add("active");

  currentStep = 1;

  showStep(currentStep);

  updateDocumentRequirements();

  updateProgress();
}

function nextStep() {
  if (!validateStep(currentStep)) {
    return;
  }

  if (currentStep < totalSteps) {
    currentStep++;

    showStep(currentStep);

    updateProgress();
  }
}

function previousStep() {
  if (currentStep > 1) {
    currentStep--;

    showStep(currentStep);

    updateProgress();
  }
}

function showStep(step) {
  document.querySelectorAll(".form-step").forEach((formStep) => {
    formStep.classList.remove("active");
  });

  const selectedStep = document.querySelector(
    `.form-step[data-step="${step}"]`,
  );

  if (selectedStep) {
    selectedStep.classList.add("active");
  }
}

function updateProgress() {
  const progressFill = document.getElementById("progressFill");

  const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  progressFill.style.width = `${percentage}%`;

  document.querySelectorAll(".step").forEach((step, index) => {
    if (index + 1 <= currentStep) {
      step.classList.add("active");
    } else {
      step.classList.remove("active");
    }
  });
}

function validateStep(step) {
  const currentFormStep = document.querySelector(
    `.form-step[data-step="${step}"]`,
  );

  if (!currentFormStep) {
    return true;
  }

  const inputs = currentFormStep.querySelectorAll(
    "input[required], select[required]",
  );

  for (const input of inputs) {
    if (!input.value.trim()) {
      input.focus();

      alert(`Please complete the ${getFieldLabel(input)} field.`);

      return false;
    }
  }

  if (step === 5) {
    return validateDocuments();
  }

  return true;
}

function getFieldLabel(input) {
  const label = document.querySelector(`label[for="${input.id}"]`);

  if (label) {
    return label.textContent.replace("*", "").trim();
  }

  return input.id;
}

function updateDocumentRequirements() {
  const employmentStatus = document.getElementById("employmentStatus").value;

  const employedDocuments = document.getElementById("employedDocuments");

  const selfEmployedDocuments = document.getElementById(
    "selfEmployedDocuments",
  );

  const otherStatusDocuments = document.getElementById("otherStatusDocuments");

  employedDocuments.style.display = "none";

  selfEmployedDocuments.style.display = "none";

  otherStatusDocuments.style.display = "none";

  removeRequiredAttributes();

  if (employmentStatus === "Employed") {
    employedDocuments.style.display = "block";

    setRequired("proofOfIncome", true);

    setRequired("employmentLetter", true);

    setRequired("employedProofOfResidence", true);
  } else if (employmentStatus === "Self-Employed") {
    selfEmployedDocuments.style.display = "block";

    setRequired("sixMonthBankStatements", true);

    setRequired("incomeAffidavit", true);

    setRequired("cipcRegistration", true);

    setRequired("selfEmployedProofOfResidence", true);
  } else {
    otherStatusDocuments.style.display = "block";

    setRequired("unemployedProofOfResidence", true);
  }
}

function setRequired(id, required) {
  const input = document.getElementById(id);

  if (input) {
    input.required = required;
  }
}

function removeRequiredAttributes() {
  const fileInputs = document.querySelectorAll(
    "#applicationForm input[type='file']",
  );

  fileInputs.forEach((input) => {
    input.required = false;
  });
}

function setupFileValidation() {
  const fileInputs = document.querySelectorAll(
    "#applicationForm input[type='file']",
  );

  fileInputs.forEach((input) => {
    input.addEventListener("change", function () {
      const file = this.files[0];

      const displayElement = document.getElementById(`${this.id}Name`);

      if (!file) {
        if (displayElement) {
          displayElement.textContent = "";
        }

        return;
      }

      if (!allowedFileTypes.includes(file.type)) {
        alert("Invalid file type. Please upload PDF, JPG, JPEG or PNG.");

        this.value = "";

        if (displayElement) {
          displayElement.textContent = "";
        }

        return;
      }

      if (file.size > maxFileSize) {
        alert("File is too large. The maximum size is 5 MB.");

        this.value = "";

        if (displayElement) {
          displayElement.textContent = "";
        }

        return;
      }

      if (displayElement) {
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);

        displayElement.textContent = `${file.name} (${sizeInMB} MB)`;
      }
    });
  });
}

function validateDocuments() {
  const employmentStatus = document.getElementById("employmentStatus").value;

  if (employmentStatus === "Employed") {
    const requiredDocuments = [
      {
        id: "proofOfIncome",
        name: "Proof of Income",
      },

      {
        id: "employmentLetter",
        name: "Employment Letter",
      },

      {
        id: "employedProofOfResidence",
        name: "Proof of Residence",
      },
    ];

    return validateRequiredFiles(requiredDocuments);
  }

  if (employmentStatus === "Self-Employed") {
    const requiredDocuments = [
      {
        id: "sixMonthBankStatements",
        name: "6 Months Bank Statements",
      },

      {
        id: "incomeAffidavit",
        name: "Affidavit Confirming Business Income",
      },

      {
        id: "cipcRegistration",
        name: "CIPC / CK Registration Documents",
      },

      {
        id: "selfEmployedProofOfResidence",
        name: "Proof of Residence",
      },
    ];

    return validateRequiredFiles(requiredDocuments);
  }

  const requiredDocuments = [
    {
      id: "unemployedProofOfResidence",
      name: "Proof of Residence",
    },
  ];

  return validateRequiredFiles(requiredDocuments);
}

function validateRequiredFiles(documents) {
  for (const doc of documents) {
    const input = document.getElementById(doc.id);

    if (!input || !input.files || input.files.length === 0) {
      alert(`Please upload the required document: ${doc.name}.`);
      return false;
    }

    const file = input.files[0];

    if (file.size > maxFileSize) {
      alert(`${doc.name} cannot be larger than 5 MB.`);
      return false;
    }

    if (!allowedFileTypes.includes(file.type)) {
      alert(`${doc.name} must be a PDF, JPG, JPEG or PNG file.`);
      return false;
    }
  }

  return true;
}

async function submitApplication() {
  const employmentStatus = document.getElementById("employmentStatus").value;

  /*
   * FIX:
   * Unit type uses radio buttons with
   * name="unitType", not id="unitType".
   */
  const selectedUnitType = document.querySelector(
    'input[name="unitType"]:checked',
  );

  if (!selectedUnitType) {
    alert("Please select your preferred unit type.");

    return;
  }

  const formData = new FormData();

  formData.append(
    "firstName",
    document.getElementById("firstName").value.trim(),
  );

  formData.append("surname", document.getElementById("surname").value.trim());

  formData.append("email", document.getElementById("email").value.trim());

  formData.append("phone", document.getElementById("phone").value.trim());

  formData.append(
    "householdSize",
    document.getElementById("householdSize").value,
  );

  formData.append(
    "housingSituation",
    document.getElementById("housingSituation").value,
  );

  formData.append("employmentStatus", employmentStatus);

  formData.append(
    "monthlyIncome",
    document.getElementById("monthlyIncome").value,
  );

  /*
   * FIXED UNIT TYPE
   */
  formData.append("unitType", selectedUnitType.value);

  if (employmentStatus === "Employed") {
    appendFile(formData, "proofOfIncome", "proofOfIncome");

    appendFile(formData, "employmentLetter", "employmentLetter");

    appendFile(formData, "proofOfResidence", "employedProofOfResidence");

    appendFile(formData, "bankStatement", "bankStatement");

    appendFile(formData, "otherDocument", "employedOtherDocument");
  } else if (employmentStatus === "Self-Employed") {
    appendFile(formData, "sixMonthBankStatements", "sixMonthBankStatements");

    appendFile(formData, "incomeAffidavit", "incomeAffidavit");

    appendFile(formData, "cipcRegistration", "cipcRegistration");

    appendFile(formData, "proofOfResidence", "selfEmployedProofOfResidence");

    appendFile(formData, "businessIncomeProof", "businessIncomeProof");

    appendFile(formData, "otherDocument", "selfEmployedOtherDocument");
  } else {
    appendFile(formData, "proofOfResidence", "unemployedProofOfResidence");

    appendFile(formData, "otherDocument", "unemployedOtherDocument");
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = "Unable to submit application.";

      try {
        const errorData = JSON.parse(responseText);

        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (error) {
        if (responseText) {
          errorMessage = responseText;
        }
      }

      throw new Error(errorMessage);
    }

    const application = JSON.parse(responseText);

    document.getElementById("applicationPage").classList.remove("active");

    document.getElementById("successPage").classList.add("active");

    document.getElementById("referenceNumber").textContent =
      application.referenceNumber;
  } catch (error) {
    console.error("Application submission error:", error);

    alert(`Application submission failed: ${error.message}`);
  }
}

function appendFile(formData, fieldName, inputId) {
  const input = document.getElementById(inputId);

  if (input && input.files && input.files.length > 0) {
    formData.append(fieldName, input.files[0]);
  }
}

function clearFileNames() {
  document.querySelectorAll(".file-name").forEach((element) => {
    element.textContent = "";
  });
}
