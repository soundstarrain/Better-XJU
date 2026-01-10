# Privacy Policy for Better-XJU

**Effective Date:** January 11, 2026

## 1. Introduction
"Better-XJU" (hereinafter referred to as "the Extension") is an independent, open-source browser extension designed to modernize the user interface and enhance the user experience of the Xinjiang University (XJU) student management systems. 

**Disclaimer: This extension is NOT affiliated with, maintained by, or endorsed by Xinjiang University.**

We take your privacy seriously. **Our core principle is: We do not collect, store, or transmit your personal data to any external servers owned by the developer.**

## 2. Data Handling and Processing

### 2.1. Academic and Personal Data
The Extension fetches academic data (such as grades, rankings, and schedules), personal information (name, student ID), and campus life data (card balance, library loans) directly from official Xinjiang University servers (`*.xju.edu.cn`).
*   **Processing:** All data is processed locally within your browser to render the modernized dashboard.
*   **Storage:** Some data may be cached in your browser's `chrome.storage.local` to provide offline access and faster loading times. This data remains on your device.
*   **Transmission:** No academic or personal data is ever sent to the developer or any third party.

### 2.2. Authentication and Credentials
The Extension does **not** ask for, see, or store your university account password.
*   **Session-Based:** It relies on your existing active sessions in the browser.
*   **Cookies:** The Extension accesses session cookies and local/session storage tokens solely to authenticate requests to the university's back-end APIs on your behalf.

### 2.3. Network Requests and Header Modification
To ensure compatibility with legacy university systems (e.g., Kingosoft/青果), the Extension uses the `declarativeNetRequest` API.
*   **Purpose:** This is used exclusively to modify "Referer" and "Origin" headers of requests sent to `*.xju.edu.cn` to mimic official browser behavior, ensuring the legacy system grants access to the required data.
*   **No Interception:** We do not intercept or record any sensitive data transmitted during these requests.

### 2.4. Third-Party Services
*   **Weather Data:** To display local weather on the dashboard, the Extension may make a request to a public weather API (e.g., `wttr.in`). This request only contains a general city name (Urumqi) and no personally identifiable information.

## 3. Permissions Justification

The Extension requests the following permissions for specific functional reasons:
*   **`storage`:** To save user preferences and cache academic data for faster performance.
*   **`cookies`:** To retrieve authentication tokens required to fetch data from the "OneTable" and "Ehall" systems.
*   **`declarativeNetRequest`:** To modify HTTP headers for compatibility with the university's legacy server-side security checks.
*   **`host_permissions` (`*://*.xju.edu.cn/*`):** Required to fetch data and inject the modernized UI into the university's web domains.

## 4. Data Security
Data stored in `chrome.storage.local` is as secure as your browser itself. We recommend:
*   Do not use this Extension on shared or public computers.
*   Always log out of your university account when finished.

## 5. Changes to This Policy
We may update this Privacy Policy to reflect changes in the Extension's features or university system updates. The "Effective Date" will be updated accordingly.

## 6. Contact
If you have questions regarding this policy or the Extension's data handling, please contact the developer via the official project repository on GitHub.