import React, { useRef } from "react";
import * as XLSX from "xlsx";

const FileRead = () => {
  const fileInputRef = useRef();

  const handleFileChange = async () => {
    const file = fileInputRef.current.files[0];

    if (!file) {
      alert("Please select an Excel file.");
      return;
    }

    try {
      const data = await readFile(file);

      analyzeData(data);
    } catch (error) {
      console.error("Error reading the file:", error);
    }
  };

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        resolve(jsonData);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const analyzeData = (data) => {
    const nameIndex = data[0].indexOf("Employee Name");
    const startDateIndex = data[0].indexOf("Pay Cycle Start Date");
    const shifttimeIndex = data[0].indexOf("Timecard Hours (as Time)");
    const timeIndex = data[0].indexOf("Time");
    const positionIndex = data[0].indexOf("Position Status");

    //console.log(nameIndex,startDateIndex,shifttimeIndex);

    //who have less than 10 hours of time between shifts but greater than 1 hour
    const emplyeeArr = [];
    data.slice(1).forEach((row) => {
      const shiftTime = row[shifttimeIndex];
      if (shiftTime) {
        const timeString = shiftTime;
        const [hours, minutes] = timeString.split(":").map(Number);
        if (hours + minutes / 60 > 14) {
          if (!emplyeeArr.includes(row[nameIndex])) {
            emplyeeArr.push(row[nameIndex]);
          }
        }
      }
    });
    console.log(emplyeeArr);
    const Employeework = [];
    const findEmployeesWorkedFor7Days = (data) => {
      const uniqueEmployeeNames = [
        ...new Set(data.slice(1).map((entry) => entry[nameIndex])),
      ];
      //console.log(uniqueEmployeeNames);

      uniqueEmployeeNames.forEach((employeeName) => {
        const personData = data
          .slice(2)
          .filter((entry) => entry[nameIndex] === employeeName);

        let count = 0;
        let currentTime;

        for (let i = 0; i < personData.length; i++) {
          // Assuming timeIndex represents a time in hours (for example, 10.25 for 10:15 AM)
          const currentTimeEntry = Math.floor(personData[i][timeIndex]);

          if (
            currentTime !== undefined &&
            currentTimeEntry - currentTime <= 1
          ) {
            count++;
            // console.log(currentTimeEntry);
          } else {
            count = 1;
          }

          currentTime = currentTimeEntry;
        }

        if (count >= 7) {
          Employeework.push(employeeName);
     //     console.log(`${employeeName} has worked for 7 consecutive days.`);
          // If you want to store the result, you can push it to the array
          // employeesWorkedFor7Days.push(employeeName);
        }
      });
    console.log(Employeework);
    };

    findEmployeesWorkedFor7Days(data);
  };

  return (
    <div>
      <input
        type="file"
        accept=".xlsx"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default FileRead;
