package com.travelsphere.food;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EnableDiscoveryClient
@ComponentScan(basePackages = {"com.travelsphere.food", "com.travelsphere.common"})
public class FoodDeliveryServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(FoodDeliveryServiceApplication.class, args);
    }
}
