
export const TestApi =() => {

    const  callToApi = async()=>{
         const response = await fetch("http://localhost:5000/api/getfeed", {

            method: 'GET',
            headers: {
                'content-type': 'application/json',
            },
            credentials: 'include'
        });

        // const data = await response.json();
        // console.log(data);
            
    }

    try {

            callToApi();

       
    } catch (error) {
        console.log("erroo in the sign", error);
    }

}