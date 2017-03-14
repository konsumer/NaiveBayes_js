var Seen = function() {
    this.seen = 0;
    this.likelyhood = 0;
    this.posteriorProbability = 0;
}

Seen.prototype.setLikelyhood = function(class_prior) {
    this.likelyhood  = this.seen / class_prior;
}

Bayes = {
    setup: function (all_buckets, all_dimensions) {
        this.dimension_names = all_dimensions;
        this.dimensions_LoH = []; //e.g., ["HEIGHT","WATCHES_FOOTBALL","LIKES_LEGOS", "BALLET", "WEIGHT"]
        this.buckets = {};//e.g., ["MALE","FEMALE"]
        this.total = 0;
        this.final_results = {};
        for ( var index in all_buckets) {
            let key = all_buckets[index];
            this.buckets[key] = new Seen();
        }

        for ( var index in all_dimensions) {
            this.dimensions_LoH[index] = {};
        }
    },

    train: function (bucket, actual_observations) {

        for ( var index in actual_observations) {
            let actual = actual_observations[index];
            if (!this.dimensions_LoH[index].hasOwnProperty(actual)) {
                this.dimensions_LoH[index][actual] = {};
            }
            if (!this.dimensions_LoH[index][actual].hasOwnProperty(bucket)) {
                this.dimensions_LoH[index][actual][bucket] = new Seen();
            }
            this.dimensions_LoH[index][actual][bucket].seen++;
        }
        this.buckets[bucket].seen++;
        this.total++;
    },

    calculate: function () {
        for (var index in this.dimensions_LoH) {
            for (var actual in this.dimensions_LoH[index]) {
                for (var bucket in this.dimensions_LoH[index][actual]) {
                    let seen = this.dimensions_LoH[index][actual][bucket];
                    let subtotal = this.buckets[bucket].seen;
                    this.dimensions_LoH[index][actual][bucket].setLikelyhood(subtotal);
                }
            }
        }
    },

    guess : function(given_dimensions) {


        // Step1 ///////// FIND LIKELYHOODS

        var results = {};
        // This loop to multiply each of the P(x[i]|c)
        for (var index in given_dimensions) {
            var actual = given_dimensions[index];
            for (var bucket in this.dimensions_LoH[index][actual]) {
                let seen = this.dimensions_LoH[index][actual][bucket];
                let subtotal = this.buckets[bucket].seen;
                //console.log(index + " " + actual + " " + bucket + " seen " + seen.seen + " likelyhood: " + seen.likelyhood.toFixed(3) + "  sub " + subtotal );
                this.dimensions_LoH[index][actual][bucket].setLikelyhood(subtotal);
                if ( ! results.hasOwnProperty(bucket)) {
                    results[bucket] = seen.likelyhood;
                } else {
                    results[bucket] *= seen.likelyhood;
                }
            }
        }

        // This loop to multiply the above against P(c)
        var all_likelyhoods = 0;

        for ( var bucket in this.buckets ) {
            let bucket_likelyhood = this.buckets[bucket].seen / this.total; // e.g., 5/9
            results[bucket] *= bucket_likelyhood;
            //console.log("bucket_likelyhood: " + bucket_likelyhood + " this.buckets[bucket] " + this.buckets[bucket].seen);
            all_likelyhoods += bucket_likelyhood;
        }


        // Step2 ///////// NORMALIZE
        for ( var bucket in results) {

            var b = "A: " + bucket + "\t" + results[bucket] + "\t" + all_likelyhoods;

            results[bucket] /= all_likelyhoods;

            b = "A: " + bucket + "\t" + results[bucket] + "\t" + all_likelyhoods;


            console.log(b);


        }
        this.final_results = results;
        return results;
    },

    display : function() {
        for (var index in this.dimensions_LoH) {
            console.log("Index " + this.dimension_names[index] ) ;
            for (var actual in this.dimensions_LoH[index]) {
                for (var bucket in this.dimensions_LoH[index][actual]) {
                    let seen = this.dimensions_LoH[index][actual][bucket];
                    let subtotal = this.buckets[bucket].seen;

                    console.log("\t" + actual + "\t" + bucket + "\t" + seen.seen + " Likelyhood: " + seen.likelyhood.toFixed(3) + " subtotal: " + subtotal );
                }
            }
        }

        console.log("+------ TOTALS ----------------+");
        for ( var key in this.buckets ) {
            let seen = this.buckets[key];
            console.log(seen.seen +"\t" + key );
        }
        console.log("+------ RESULTS ----------------+");
        for ( var bucket in this.final_results) {
            console.log(bucket + "\t" + this.final_results[bucket]);
        }
    }
}

try {
    exports.Bayes = Bayes;
} catch ( if_this_is_from_the_web_then_ignore_this ) {
    console.log(if_this_is_from_the_web_then_ignore_this);
}