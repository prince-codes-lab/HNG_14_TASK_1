
const Profile = require('../db/models/Profile');
const {uuidv7} = require('uuidv7');

const createProfile =  async (req, res, next) => {

    const {name} = req.body;

    if(name === undefined || name === null || String(name).trim() === ""){
        return res.status(400).json({
            status: "error",
            message: "Name is required and cannot be empty"
        });
    }


        // Check if name is the wrong type (e.g. someone sent a number)
    if (typeof name !== 'string') {
      return res.status(422).json({
        status: 'error',
        message: 'Invalid type',
      });
    }

    const cleanName = name.trim().toLowerCase();

 

    try{
            const name_Exists = await Profile.findOne({name: cleanName}, {_id: 0, __v: 0});

    if(name_Exists){
        return res.status(200).json({
            status: "success",
            message: "Profile already exists",
            data: name_Exists.toObject()
        })
    }

        const  [genderRes, agifyRes, nationalizeRes] = await Promise.all([
            fetch(`https://api.genderize.io?name=${encodeURIComponent(cleanName)}`),
            fetch(`https://api.agify.io?name=${encodeURIComponent(cleanName)}`),
            fetch(`https://api.nationalize.io?name=${encodeURIComponent(cleanName)}`)        
        ]);

        const [genderData, ageData, nationalityData] = await Promise.all([
            genderRes.json(),
            agifyRes.json(),
            nationalizeRes.json()
        ]);

        if (!genderData.gender || genderData.count === 0 ) {
            throw {code: 502, api: 'Genderize'};
        }


// ✅ Only check what the task specifies
        if (ageData.age === null || ageData.age === undefined) {
    throw { code: 502, api: 'Agify' };
            };

        const classify_age = ageData.age > 0 && ageData.age <= 12 ? "child" : 
        ageData.age > 12 && ageData.age <= 19 ? "teenager" : 
        ageData.age > 19 && ageData.age <= 59 ? "adult" : ageData.age > 59 ? "senior" : "unknown" ;

                    if (!nationalityData.country || nationalityData.country.length === 0) {
                    throw { code: 502, api: 'Nationalize' };
                    }

        const classify_nationality = nationalityData.country.reduce((highest, current) => {
            return current.probability > highest.probability ?  current : highest;
        });

        const newProfile = {
            id: uuidv7(),
            name: cleanName,
            gender: genderData.gender,
            gender_probability: genderData.probability,
            sample_size: genderData.count,  // "count" in Genderize = sample_size
            age: ageData.age,
            age_group: classify_age,
            country_id: classify_nationality.country_id,
            country_probability: classify_nationality.probability,
            created_at: new Date().toISOString()
        }

        await Profile.create(newProfile);

        return res.status(201).json({
            status: "success",
            data: newProfile
     });

    }

    catch(err){
            if(err.code === 502){
                return res.status(502).json({
                    status: "error",
                    message: `${err.api} returned an invalid response`
                });
             }
            console.error('POST /api/profiles error', err);
            return res.status(500).json({
                status: "error",
                message: "An unexpected error occurred while creating the profile"
            });
    }

};








// get all profiles with optional filters
const getAllProfiles = async (req, res, next) => {

    try {

    const {gender, country_id, age_group} = req.query;

    const filter = {};

        // All filters are case-insensitive per the task requirements
    // gender and age_group are stored lowercase, country_id is stored uppercase

    if(gender) filter['gender'] = gender.toLowerCase();
    if(country_id) filter['country_id'] = country_id.toUpperCase();
    if(age_group) filter['age_group'] = age_group.toLowerCase();


       // { _id: 0 } tells MongoDB not to return the internal _id field
    const profiles = await Profile.find(filter, { _id: 0 });

    // profiles.toJSON();

    return res.status(200).json({
        status: "success",
        count: profiles.length,
        data: profiles.map((p) => ({
            id: p.id,
            name: p.name,
            gender: p.gender,
            age: p.age,
            age_group: p.age_group,
            country_id: p.country_id
        })),
    });
}

catch(err){
    console.error('GET /api/profiles error', err);
    return res.status(500).json({
        status: "error",
        message: "An unexpected error occurred while fetching profiles"
    });

}

};   // { _id: 0 } tells MongoDB not to return the internal _id field

//________________________________________

// GET /api/profiles/:id - get a single profile by its unique id

//___________________________________
    
const getProfileById = async (req, res, next) => {
    try{

    const {id} = req.params;
    const profile = await Profile.findOne({id}, {_id: 0, __v: 0});
    
    if(!profile){
        return res.status(404).json({
            status: "error",
            message: "Profile not found"
        }); }

           return res.status(200).json({
            status: "success",
            data: profile.toObject()
        });

    }

    catch(err){
        console.error('GET /api/profiles/:id error', err);
        return res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while fetching the profile"
        });
    }
};


//________________________________________

// DELETE /api/profiles/:id - delete a single profile by its unique id

//___________________________________

const deleteProfileById = async (req, res, next) => {
    try {
        const {id} = req.params;

        const result = await Profile.deleteOne({id});
        
        if(result.deletedCount === 0){
            
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found'
            });
        }

        return res.sendStatus(204); // No Content
    
    }

    catch(err){
        console.error('DELETE /api/profiles/:id error', err);
        return res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while deleting the profile"
        });
    }
}



module.exports = {createProfile, getAllProfiles, getProfileById, deleteProfileById};







/*

        const data1 = await fetch(`https://api.genderize.io?name=${encodeURIComponent(name)}`);
                  if(!data1.ok){
                throw new Error(`Failed to fetch gender data for ${name}`);
            }
        const response1 = await data1.json();

        // ------------------------------------------------------


        const data2 = await fetch(`https://api.agify.io?name=${encodeURIComponent(name)}`);
                  if(!data2.ok){
                throw new Error(`Failed to fetch age data for ${name}`);
            }

        const response2 = await data2.json();
        const classify_age = response2.age > 0 && response2.age <= 12 ? "child" : 
        response2.age > 12 && response2.age <= 19 ? "teenager" : 
        response2.age > 19 && response2.age <= 59 ? "adult" : response2.age > 59 ? "senior" : "unknown" ;



    // ------------------------------------------------------    
        
        const data3 = await fetch(`https://api.nationalize.io?name=${encodeURIComponent(name)}`);
            if(!data3.ok){
                throw new Error(`Failed to fetch nationality data for ${name}`);
            }
        const response3 = await data3.json();
        const classify_nationality = response3.country.reduce((highest, current) => {
            return current.probability > highest.probability ?  current : highest;
        });

        console.log(response1, response2, response3, classify_age, classify_nationality);


        */
