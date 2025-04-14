# Flood evecuation route optimisation using graph theory


Web application to calculate shortest, safest evacuation routes during floods. ⚠️

*   Utilizes OpenStreetMap road data (OSMnx), Shapely for flood zone analysis, and A\* search to avoid inundated areas, enhancing public safety and emergency response. 🗺️
*   FastAPI backend, React/OpenLayers frontend. 🚀

  
## working demo

https://github.com/user-attachments/assets/1470ab4b-fcae-4809-b044-5971d76b18b5



## 🛠️ Installation

1.  **Prerequisites:**

    *   Node.js (v16 or higher)
    *   Python 3.8 or higher
    *   pip (Python package installer)
    *   npm or yarn
2.  **Clone the repository:**

    ```bash
    git clone https://github.com/anshgupta517/flood-evacuation.git
    cd flood-evacuation
    ```
3.  **Backend Setup:**

    *   Navigate to the `backend` directory:

        ```bash
        cd backend
        ```
    *   Create a virtual environment (recommended):

        ```bash
        python3 -m venv venv
        source venv/bin/activate  # On Linux/macOS
        # venv\Scripts\activate  # On Windows
        ```
    *   Install dependencies:

        ```bash
        pip install -r requirements.txt
        ```
    *   Run the backend:

        ```bash
        uvicorn main:app --reload
        ```

4.  **Frontend Setup:**

    *   Navigate to the `frontend` directory:

        ```bash
        cd ../frontend
        ```
    *   Install dependencies:

        ```bash
        npm install # or yarn install
        ```
    *   Start the frontend development server:

        ```bash
        npm start # or yarn start
        ```

## ✨ Key Features

*   **Real-time Route Optimization:** Calculates the safest and shortest evacuation routes based on current flood conditions. 🧭
*   **Flood Zone Analysis:** Integrates flood zone data to identify and avoid inundated areas. 🌊
*   **Interactive Map Interface:** User-friendly map interface powered by React and OpenLayers. 🗺️
*   **OpenStreetMap Integration:** Leverages OpenStreetMap data for accurate road network information. 🛣️
*   **A\* Search Algorithm:** Employs the A\* search algorithm to efficiently find optimal routes. 🤖

## 🤝 Contributing

Contributions are welcome! Here's how you can contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with descriptive messages.
4.  Push your changes to your fork.
5.  Submit a pull request to the main branch of the original repository.

## 📝 License

No license file found. All rights reserved by the owner.

## 🔗 Homepage

[https://flood-evacuation.vercel.app](https://flood-evacuation.vercel.app)

