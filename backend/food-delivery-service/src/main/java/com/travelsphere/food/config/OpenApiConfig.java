package com.travelsphere.food.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("TravelSphere Food Delivery API")
                        .version("1.0.0")
                        .description("Food delivery service for TravelSphere platform - restaurants, menus, and ordering"));
    }
}
