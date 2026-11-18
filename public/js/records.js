const records = {
    KEY: "nightshift_records",

    load: function(){
        try{
            return JSON.parse(localStorage.getItem(this.KEY)) || [];
        } catch (e){
            return [];
        }
    },

    add: function(data){
        const list = this.load();
        list.push(data); // data = { name, score, level, result, date}
        list.sort((a,b) => b.score - a.score);
        localStorage.setItem(this.KEY, JSON.stringify(list.slice(0, 10)));
        localStorage.setItem('nightshift_last', JSON.stringify(data));
    }


};
