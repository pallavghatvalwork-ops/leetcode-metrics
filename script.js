document.addEventListener("DOMContentLoaded",function(){

    const searchBtn = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgress = document.querySelector(".easy-progress");
    const mediumProgress = document.querySelector(".medium-progress");
    const hardProgress = document.querySelector(".hard-progress");

    const easyLabel=document.getElementById("easy-label");
    const mediumLabel=document.getElementById("medium-label");
    const hardLabel=document.getElementById("hard-label");
    
    const cardStats=document.querySelector(".stats-cards");


    function validateUser(username){
        if(username.trim()=== ""){
            alert("Username should not be empty");
            return false;
        }

        const regex= /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatch=regex.test(username);
        if(!isMatch){
            alert("Invalid Username");
        }
        return isMatch;
    }

    async function fetchUserDetails(username){
        const url= `https://leetcode.com/graphql`;

        try{

            cardStats.innerHTML = "";
            easyLabel.textContent = "";
            mediumLabel.textContent = "";
            hardLabel.textContent = "";

            easyProgress.style.setProperty("--progress-degree", "0%");
            mediumProgress.style.setProperty("--progress-degree", "0%");
            hardProgress.style.setProperty("--progress-degree", "0%");

            // (optional loading UI)
            statsContainer.classList.remove("hidden");
            cardStats.innerHTML = "<p>Loading...</p>";

            searchBtn.textContent = "Searching...";
            searchBtn.disabled = true;
            // statsContainer.classList.add("hidden");

            // const response = await fetch(url);
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/' 
            const targetUrl = 'https://leetcode.com/graphql';
            
            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query: "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ",
                variables: { "username": `${username}` }
            })
            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
            };

            const response = await fetch(proxyUrl+targetUrl, requestOptions);
            if(!response.ok) {
                throw new Error("Unable to fetch the User details");
            }
            const parsedData = await response.json();
            console.log("Logging data: ", parsedData) ;

            displayUserData(parsedData);

        }catch(error){
            console.error("Error:", error);
            statsContainer.classList.remove("hidden");
            statsContainer.innerHTML = `<p>Error fetching data</p>`;
        }

        finally{
            searchBtn.textContent="Search";
            searchBtn.disabled=false;
        }
    }

    function updateProgress(solved,total,label,circle){
        const progressDegree= (solved/total)*100;
        circle.style.setProperty("--progress-degree",`${progressDegree}%`);
        label.textContent=  `${solved}/${total}`;
    }

    function displayUserData(parsedData){
        statsContainer.classList.remove("hidden");
        // statsContainer.innerHTML = "";
        const totalQues= parsedData.data.allQuestionsCount[0].count;
        const totalEasyQues= parsedData.data.allQuestionsCount[1].count;
        const totalMediumQues= parsedData.data.allQuestionsCount[2].count;
        const totalHardQues= parsedData.data.allQuestionsCount[3].count;

        const solvedTotalQues=parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedTotalEasyQues=parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedTotalMediumQues=parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedTotalHardQues=parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(solvedTotalEasyQues,totalEasyQues,easyLabel,easyProgress);
        updateProgress(solvedTotalMediumQues,totalMediumQues,mediumLabel,mediumProgress);
        updateProgress(solvedTotalHardQues,totalHardQues,hardLabel,hardProgress);

        const cardsData=[
            {label:"Overall Submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions},
            {label:"Overall Easy Submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions},
            {label:"Overall Medium Submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions},
            {label:"Overall Hard Submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions},

        ];

        console.log("card:",cardsData);
        console.log("cardStats:", cardStats);
        cardStats.innerHTML = cardsData.map(data => `
            <div class="card">
                <h3>${data.label}</h3>
                <p>${data.value}</p>
                </div>
        `).join("");


    }

    searchBtn.addEventListener('click',function(){
        const username=usernameInput.value;
        console.log("name:",username);

        if(validateUser(username)){
            fetchUserDetails(username);
        }
    })




})