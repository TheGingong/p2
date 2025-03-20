

testarray = [
    {
        title: 'title', 
        start: '2025-03-20', 
        end: '2025-03-23',
        resourceIds: ['a']
    },
    {
        title: 'title', 
        start: '2025-03-21', 
        end: '2025-03-25',
        resourceIds: ['c']
    },
    {
        title: 'title', 
        start: '2025-03-18', 
        end: '2025-03-24',
        resourceIds: ['b']
    }

]


function hej(testarray){
    console.log(testarray)

    for (let i = 0; i < testarray.length; i++){
        calendar.addEvent({
            title: testarray[i].title, 
            start: testarray[i].start, 
            end: testarray[i].end,
            resourceIds: [testarray[i].resourceIds]
        });
    }



      
    
      

}

