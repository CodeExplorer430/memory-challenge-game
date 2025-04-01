bdocument.addEventListener('DOMContentLoaded', () => {
    const leaderboardBody = document.getElementById('globalLeaderboard');
    
    function updateLeaderboard() {
        db.collection('scores')
            .orderBy('score', 'desc')
            .limit(100)
            .get()
            .then(querySnapshot => {
                leaderboardBody.innerHTML = '';
                let rank = 1;
                
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    leaderboardBody.innerHTML += `
                        <tr>
                            <td>${rank++}</td>
                            <td>${data.name}</td>
                            <td>${data.score}</td>
                            <td>${data.difficulty}</td>
                            <td>${new Date(data.timestamp).toLocaleDateString()}</td>
                        </tr>
                    `;
                });
            })
            .catch(error => console.error('Leaderboard error:', error));
    }

    // Update leaderboard every 10 seconds
    setInterval(updateLeaderboard, 10000);
    updateLeaderboard();
});