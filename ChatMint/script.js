let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let image = document.querySelector("#image img");
let imageinput = document.querySelector("#image input");

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDnMdm-TXlizToAgAGojrvjQph_jttRXaM";

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
};

async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area");

    let parts = user.file.data
        ? [
            { text: user.message },
            { inline_data: { mime_type: user.file.mime_type, data: user.file.data } }
        ]
        : [
            { text: user.message }
        ];

    let RequestOption = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: parts
                }
            ]
        })
    };

    try {
        let response = await fetch(Api_Url, RequestOption);
        let data = await response.json();
        let apiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/\\(.?)\\*/g, "$1")?.trim();

        if (apiResponse) {
            text.innerHTML = apiResponse;
        } else {
            text.innerHTML = "🤖 Sorry, I couldn't understand that.";
        }
    } catch (error) {
        console.log(error);
        text.innerHTML = "⚠ Error while fetching response.";
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
        image.src = "img.svg"; // Ensure 'img.svg' exists
        image.classList.remove("choose");
        user.file = {
            mime_type: null,
            data: null
        };
    }
}

function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

function handlechatResponse(userMessage) {
    if (!userMessage.trim()) return;

    user.message = userMessage;

    let userImageHtml = `<img src="user.png" alt="User" id="userImage" width="8%">`;
    let fileImageHtml = user.file.data
        ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />`
        : "";

    let userChatHtml = `
        ${userImageHtml}
        <div class="user-chat-area">
            ${user.message}
            ${fileImageHtml}
        </div>
    `;

    prompt.value = "";
    let userChatBox = createChatBox(userChatHtml, "user-chat-box");
    chatContainer.appendChild(userChatBox);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        let aiChatHtml = `
            <img src="ai.png" alt="AI" id="aiImage" width="10%">
            <div class="ai-chat-area">
                <img src="loading.webp" alt="Loading..." class="load" width="50px">
            </div>`;
        let aiChatBox = createChatBox(aiChatHtml, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 600);
}

// Event Listeners
prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handlechatResponse(prompt.value);
    }
});

submitbtn.addEventListener("click", () => {
    handlechatResponse(prompt.value);
});

imageinput.addEventListener("change", () => {
    const file = imageinput.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64string
        };
        image.src = `data:${user.file.mime_type};base64,${user.file.data}`;
        image.classList.add("choose");
    };
    reader.readAsDataURL(file);
});

imagebtn.addEventListener("click", () => {
    imageinput.click();
});
