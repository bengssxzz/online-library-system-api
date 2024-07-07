const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

require("../Schema/pdfDetails"); 
const PdfDetailsSchema = mongoose.model("PdfDetails");

require("../Schema/regStudents");
const regStudentsSchema = mongoose.model("regStudents")

require("../Schema/studInfo");
const studInfoSchema = mongoose.model("studInfo")

require("../Schema/pdfStatistics");
const pdfStatistics = mongoose.model("pdfstat");

require("../Schema/auditLogs");
const auditSchema = mongoose.model("auditLog")

//MULTER FOR FILE UPLOAD
const multer  = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now()
      cb(null, uniqueSuffix + req.body.Title.replace(/[^\w]/gi, '_') +".pdf")
    }
  })
  
  const upload = multer({ storage: storage })

//API 
router.get('/', (req, res)=> {
    return res.json("backend");
})

router.post("/upload-pdf", upload.single("File"), async (req, res) => {

    const title = req.body.Title;
    const author = req.body.Author;
    const year = req.body.Year;
    const category = req.body.Category;
    const fileDest = req.file.filename;
    const action = "Upload PDF" 
    const date = Date.now()

    try{
        const matchedTitles = await PdfDetailsSchema.find({title: title})

        if (matchedTitles.length > 0){
            res.json({status: "There's an existing PDF with that title! Please try again."});
        }
        else{
            try {
                await PdfDetailsSchema.create({
                    title: title,
                    author: author,
                    year: year,
                    category: category,
                    destination: fileDest
                })
                await pdfStatistics.create({
                    title: title
                })
                await auditSchema.create({
                    action: action,
                    date: date
                })
                res.json({status: "Upload Success!"});
            } catch (error) {
                res.json({status: "Error! Try Again!"});
            }
        }
    } catch(error){
        res.json({status: "Error! Try Again!"});
    }
})

router.post("/register-stud", upload.single("Form"), async (req, res) => {

    const lrn = req.body.lrn;
    const password = req.body.password;
    const regDate = Date.now();

    try {
        // await studInfoSchema.create({
        //     lrn: lrn,
        //     password: password,
        //     regDate: regDate
        // })

        // res.json({status: "Student Registered!"});

        const lrnList = await studInfoSchema.find({lrn: lrn})
        const regList = await regStudentsSchema.find({lrn: lrn})

        if (lrnList.length !== 0){
			if (regList.length === 0){
            	await regStudentsSchema.create({
                	lrn: lrn,
                	password: password,
                	regDate: regDate
            	})
            	res.json({status: "Student Registered!"});
        	}

			else {
            	res.json({status: "Student already registered!"});
        	}
        }

        else {  
            return(res.json({status: "Student LRN does not exist!"}));
        }

        

    } catch (error) {
        res.json({status: "Error! Try Again!"});
    }
})

router.get('/login', (req, res) => {
    try {
        regStudentsSchema.find({}).then((data) => {
            res.send(data);
        });
    } catch (error) {
        res.json({status: "Student not found!"});
    }
})

router.post('/viewAdd', (req, res) => {
    const title = req.body.Title;
    var count;
    try {
        pdfStatistics.findOne({title: title})
            .then((data) => {
                count = data.view;
                data.view = count + 1;
                data.save();
                res.send({status: 200});
            });
        
    } catch (error) {

        res.send(error);
    }
})

router.post('/downloadAdd', (req, res) => {
    const title = req.body.Title;
    var count;
    try {
        pdfStatistics.findOne({title: title})
            .then((data) => {
                count = data.download;
                data.download = count + 1;
                data.save();
                
            });
        
            res.send({status: 200});

    } catch (error) {

        res.send(error);
    }
})

router.get('/getCredentials', (req, res) => {
    try {
        regStudentsSchema.find({})
        .then((data) => {
            res.send(data);
        })
    } catch (error) {
        res.send(error);
    }
})

router.post('/editCredentials', (req, res) => {
    const id = req.body.data._id;
    const action = "Change Student Password";
    const date = Date.now();

    try {
        regStudentsSchema.findById(id)
        .then((data) => {
            data.password = req.body.data.password;
            data.save();
            res.send({status: "Changing Password Success!"});
        });

        auditSchema.create({
            action: action,
            date: date
        })

    } catch (error) {
        res.send(error);
    }
})

router.post('/deleteCredentials', async (req, res) => {
    const id = req.body.id;
    const action = "Delete Student Account";
    const date = Date.now();

    try {
        await regStudentsSchema.findByIdAndDelete(id);
        
        await auditSchema.create({
            action: action,
            date: date
        })

        res.send({status: "Successfully Deleted!"});
        
        
    } catch (error) {

        res.send({status: {error}});
    }
})

// router.post('/editCredentials', (req, res) => {
//     const id = req.body.data._id;

//     try {
//         studentCreds.findById(id)
//         .then((data) => {
//             data.password = req.body.data.password;
//             data.save();
//             res.send({status: "Changing Password Success!"});
//         });
//     } catch (error) {
//         res.send(error);
//     }
// })

// router.post('/deleteCredentials', async (req, res) => {
//     const id = req.body.id;

//     try {
//         await studentCreds.findByIdAndDelete(id);

//         res.send({status: "Successfully Deleted!"});
        
        
//     } catch (error) {

//         res.send({status: {error}});
//     }
// })

router.post('/upload-students', async (req, res) => {
    const students = req.body;
    const action = "Upload CSV File";
    const date = Date.now();

    try {
        let newStudents = [];
        for (let student of students) {
            const existingStudent = await studInfoSchema.findOne({
                lrn: student.lrn
            });

            if (!existingStudent) {
                newStudents.push(student);
            }
        }

        if (newStudents.length > 0) {
            await studInfoSchema.insertMany(newStudents);
            
            await auditSchema.create({
                action: action,
                date: date
            })

            res.json({ status: 'Students data uploaded successfully', inserted: newStudents.length });
        } else {
            res.json({ status: 'No new students to insert' });
        }
    } catch (error) {
        res.json({ status: 'Error uploading data', error });
    }
});

router.post('/audit-export', async (req, res) => {
    const action = "Export CSV File";
    const date = Date.now();

    auditSchema.create({
        action: action,
        date: date
    })
});

module.exports = router;