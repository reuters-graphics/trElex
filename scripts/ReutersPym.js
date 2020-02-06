class ReutersPym {
		
	constructor(opts){
		
		this.hasPym = false;
		try {
			this.pymChild = new pym.Child({polling:500});
			if (this.pymChild.id) {				
				this.hasPym = true;
				 document.body.classList.add("pym");
			}
		}
		catch(err){	
		}
		
		
		return this;	
	}

    

}

export { ReutersPym }